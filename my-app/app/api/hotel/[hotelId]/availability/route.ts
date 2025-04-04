import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/userMiddleware";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

type tParams = Promise<{ hotelId: string }>;

export async function GET(req: NextRequest, { params }: { params: tParams }) {
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

    try {
        const { hotelId } = await params;
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate || !hotelId) {
            return NextResponse.json(
                { error: "startDate, endDate, and hotelId are required" },
                { status: 400 }
            );
        }

        if (isNaN(Number(hotelId)) && typeof hotelId !== 'string') {
            return NextResponse.json(
                { error: "Invalid hotelId format, must be string" },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Ensure startDate <= endDate
        if (start > end) {
            return NextResponse.json(
                { error: "startDate cannot be after endDate" },
                { status: 400 }
            );
        }

        const hotel = await prisma.hotel.findFirst({
            where: { id: hotelId },
        });

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        if (hotel.ownerId !== user?.id) {
            return NextResponse.json(
                { error: "User does not have permission to interact with this hotel" },
                { status: 403 }
            );
        }

        const roomTypes = await prisma.roomType.findMany({
            where: { hotelId },
            select: {
                id: true,
                name: true,
                totalRooms: true,
                roomBookings: {
                    where: {
                        OR: [
                            {
                                checkInDate: { lte: new Date(startDate) },
                                checkOutDate: { gte: new Date(endDate) },
                            },
                        ],
                    },
                    select: { id: true },
                },
            },
        });

        const availability = roomTypes.map((roomType : any) => ({
            roomType: roomType.name,
            totalRooms: roomType.totalRooms,
            bookedRooms: roomType.roomBookings.length,
            availableRooms: roomType.totalRooms - roomType.roomBookings.length,
        }));

        return NextResponse.json(availability, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error fetching availability" },
            { status: 500 }
        );
    }
}


export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
        return authResponse;
    }
    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
    });

    try {
        const hotelId = (await params).hotelId;

        let body;
        try {
            body = await req.json();  // Corrected `request.json()` to `req.json()`
        } catch (error) {
            return NextResponse.json(
                { error: 'Malformed JSON body' },
                { status: 400 }
            );
        }

        const { roomTypeId, newTotalRooms } = body;

        if (!roomTypeId || newTotalRooms === undefined) {
            return NextResponse.json(
                { error: "roomTypeId and newTotalRooms are required" },
                { status: 400 }
            );
        }

        // Validate types before passing to Prisma
        if (typeof hotelId !== 'string') {
            return NextResponse.json(
                { error: "Invalid hotelId format, must be a string" },
                { status: 400 }
            );
        }

        if (typeof roomTypeId !== 'string') {
            return NextResponse.json(
                { error: "Invalid roomTypeId format, must be a string" },
                { status: 400 }
            );
        }

        if (typeof newTotalRooms !== 'number' || newTotalRooms <= 0) {
            return NextResponse.json(
                { error: "newTotalRooms must be a positive number" },
                { status: 400 }
            );
        }

        const hotel = await prisma.hotel.findFirst({
            where: { id: hotelId },
        });

        if (!hotel || hotel.ownerId !== user?.id) {
            return NextResponse.json(
                { error: "Hotel not found or permission denied" },
                { status: 403 }
            );
        }

        const roomType = await prisma.roomType.findFirst({
            where: {
                id: roomTypeId,
                hotelId: hotelId,
            },
            include: { roomBookings: true },
        });

        if (!roomType) {
            return NextResponse.json(
                { error: "Room type not found" },
                { status: 404 }
            );
        }

        await prisma.roomType.update({
            where: { id: roomTypeId },
            data: { totalRooms: newTotalRooms },
        });

        return NextResponse.json(
            { message: "Availability updated successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error updating availability" },
            { status: 500 }
        );
    }
}