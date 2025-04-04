import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const authResponse = await authenticateUser(req);

    if (authResponse.status !== 200) {
        return authResponse;
    }

    const decodedemail = authResponse.headers.get('x-user-email');
    
    if (!decodedemail) {
        return NextResponse.json({ error: 'User email not found in token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: decodedemail },
    });

    const ownerId = user?.id;

    try {
        const url = new URL(req.url);
        const params = new URLSearchParams(url.search);

        const startDate = params.get('startDate');
        const endDate = params.get('endDate');
        const hotelId = params.get('hotelId');
        const roomTypeName = params.get('roomTypeName');

        const requiredFields = {
            ownerId,
            hotelId
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }

        if (typeof hotelId !== 'string' || hotelId.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing hotelId parameter" },
                { status: 400 }
            );
        }

        if (typeof roomTypeName !== 'string' || roomTypeName.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing roomTypeName parameter" },
                { status: 400 }
            );
        }

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (startDate && isNaN(start?.getTime() || 0)) {
            return NextResponse.json(
                { error: "Invalid startDate format" },
                { status: 400 }
            );
        }

        if (endDate && isNaN(end?.getTime() || 0)) {
            return NextResponse.json(
                { error: "Invalid endDate format" },
                { status: 400 }
            );
        }

        // Ensure startDate <= endDate
        if (start && end && start > end) {
            return NextResponse.json(
                { error: "startDate cannot be after endDate" },
                { status: 400 }
            );
        }

        const ownerUser = user;

        const hotel = await prisma.hotel.findUnique({
            where: {
                id: hotelId,
            },
        })
        
        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        if (ownerUser?.id !== hotel.ownerId) {
            return NextResponse.json(
                { error: `User does not have permission to interact with this hotel's room types` },
                { status: 400 }
            );
        }

        const filteredBookings = await prisma.booking.findMany({
            where: {
                roomBookings: {
                    some: {
                        roomType: {
                            ...(roomTypeName ? { name: roomTypeName } : {}),
                        },
                        ...(startDate ? { checkInDate: { gte: startDate } } : {}),
                        ...(endDate ? { checkOutDate: { lte: endDate } } : {}),
                    },
                },
            },
            include: {
                roomBookings: {
                    include: {
                        roomType: true,
                    },
                },
            },
        });

        return NextResponse.json({ filteredBookings }, { status: 200 });

    }
    catch (error) {
        console.error("Error parsing results:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authResponse = await authenticateUser(req);

    if (authResponse.status !== 200) {
        return authResponse;
    }
    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    const ownerId = user?.id;

    try {
        let body;
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Malformed JSON body' },
                { status: 400 }
            );
        }

        const {
            roomBookingId,
            hotelId,
        } = body;

        const requiredFields = { roomBookingId, hotelId, ownerId };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }

        if (typeof roomBookingId !== 'string' || roomBookingId.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing roomBookingId" },
                { status: 400 }
            );
        }

        if (typeof hotelId !== 'string' || hotelId.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing hotelId" },
                { status: 400 }
            );
        }

        const roomBooking = await prisma.roomBooking.findUnique({
            where: { id: roomBookingId },
            include: {
                roomType: {
                    select: { 
                        hotelId: true,
                        name: true 
                    },
                },
                booking: {
                    include: {
                        user: true
                    }
                }
            },
        });

        if (!roomBooking) {
            return NextResponse.json({ error: "Room booking not found" }, { status: 404 });
        }

        if (roomBooking.roomType.hotelId !== hotelId) {
            return NextResponse.json(
                { error: "RoomBooking does not belong to the provided hotelId" },
                { status: 400 }
            );
        }

        if (roomBooking.booking.status === "CANCELLED") {
            return NextResponse.json({ error: "This booking has already been cancelled" }, { status: 400 });
        }
        

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
        });

        if (!hotel || hotel.ownerId !== ownerId) {
            return NextResponse.json(
                { error: "user does not have permission to delete this booking" },
                { status: 403 }
            );
        }

        // Update the booking status to CANCELLED
        const deletedBooking = await prisma.booking.update({
            where: { id: roomBooking.bookingId },
            data: { status: "CANCELLED" }
        });

        // Create notification for the affected user
        await prisma.notification.create({
            data: {
                userId: roomBooking.booking.userId,
                title: "Booking Cancellation",
                message: `Your booking for ${roomBooking.roomType.name} at ${hotel.name} has been cancelled by the property owner.`,
                type: "BOOKING_CANCELLATION",
                bookingId: roomBooking.bookingId
            }
        });

        return NextResponse.json(
            { message: "room booking deleted", data: deletedBooking },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting roomBooking:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}