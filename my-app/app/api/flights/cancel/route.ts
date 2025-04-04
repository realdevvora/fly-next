import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "@/lib/userMiddleware";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {

    const authResponse = await authenticateUser(request);
    if (authResponse.status !== 200) {
        return authResponse;
    }

    const email = authResponse.headers.get('x-user-email');
    const userId = authResponse.headers.get('x-user-id');


    if (!userId) {
        return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const {lastName, flightBookingReferenceId} = await request.json();

    if (!lastName || !flightBookingReferenceId) {
        return NextResponse.json({ error: 'Last name and flight booking reference ID are required' }, { status: 400 });
    }

    if (typeof lastName !== 'string' || typeof flightBookingReferenceId !== 'string') {
        return NextResponse.json({ error: 'Last name and flight booking reference ID must be strings' }, { status: 400 });
    }

    if (lastName.length === 0 || flightBookingReferenceId.length === 0) {
        return NextResponse.json({ error: 'Last name and flight booking reference ID cannot be empty' }, { status: 400 });
    }

    if (lastName.length > 255 || flightBookingReferenceId.length > 255) {
        return NextResponse.json({ error: 'Last name and flight booking reference ID cannot be longer than 255 characters' }, { status: 400 });
    }

    const flightBookingReference = await prisma.flightBookingReference.findUnique({
        where: {
            afsBookingId: flightBookingReferenceId
        }
    });

    if (!flightBookingReference) {
        return NextResponse.json({ error: 'Flight booking reference not found' }, { status: 404 });
    }

    const id = flightBookingReference.bookingId;

    const flight = await prisma.booking.findUnique({
        where: {
            id: id
        }, 
        include: {user: true}
    });

    if (!flight) {
        return NextResponse.json({ error: 'Flight associated without a booking' }, { status: 404 });
    }

    const associatedUser = flight.user;

    if (associatedUser.email !== email) {
        return NextResponse.json({ error: 'User does not have access to this flight' }, { status: 403 });
    }

    if (associatedUser.lastName !== lastName) {
        return NextResponse.json({ error: 'User does not have access to this flight' }, { status: 403 });
    }

    const url = new URL('https://advanced-flights-system.replit.app/api/bookings/cancel');


    const response = await fetch(url, {
        body: JSON.stringify({
            lastName: lastName,
            bookingReference: flightBookingReference.afsBookingId
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.FLIGHT_API_KEY || ''
        },
        method: 'POST'
    });

    const flightData = await response.json();

    return NextResponse.json(flightData);
}