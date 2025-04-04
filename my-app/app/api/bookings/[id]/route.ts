// my-app/app/api/bookings/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {authenticateUser} from '@/lib/userMiddleware';

const prisma = new PrismaClient();

const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

// Function to check if the status is valid
function isValidStatus(status: string) {
  return Object.values(BookingStatus).includes(status);
}

type tParams = Promise<{ id: string }>;

/**
 * GET /api/bookings/:id
 * Fetches a booking by its ID. Only the owner of the booking can access it.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  const authResponse = await authenticateUser(request);
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
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const bookingId = (await params).id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBookingReferences: true,
        roomBookings: true,
      },
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/bookings/:id
 * "Cancels" a booking. In this implementation, instead of deleting the record,
 * we update its status to "CANCELLED". This preserves booking history.
 */
export async function PUT(req: NextRequest, { params }: { params: tParams }) {
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
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const bookingId = (await params).id;
  
  try {
    // Verify the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomBookings: {
          include: {
            roomType: {
              include: {
                hotel: true
              }
            }
          }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is the booking owner
    const isBookingOwner = existingBooking.userId === userId;
    
    // Check if user is a hotel owner for any of the rooms in this booking
    let isHotelOwner = false;
    
    if (existingBooking.roomBookings && existingBooking.roomBookings.length > 0) {
      isHotelOwner = existingBooking.roomBookings.some(
        (roomBooking: any) => roomBooking.roomType?.hotel?.ownerId === userId
      );
    }

    // If user is neither the booking owner nor a hotel owner, deny access
    if (!isBookingOwner && !isHotelOwner) {
      return NextResponse.json(
        { error: 'Forbidden: you must be either the booking owner or the hotel owner to cancel this booking' }, 
        { status: 403 }
      );
    }

    // Update booking status to CANCELLED
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        flightBookingReferences: true,
        roomBookings: true,
      },
    });

    // Create notification for the user who made the booking
    await prisma.notification.create({
      data: {
        userId: cancelledBooking.userId,
        title: "Booking Cancellation",
        message: `Your booking ${bookingId} has been cancelled.`,
        type: "BOOKING_CANCELLATION",
        bookingId: cancelledBooking.id
      }
    });

    return NextResponse.json(cancelledBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}