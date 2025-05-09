// my-app/app/api/user/bookings/route.js
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';

const prisma = new PrismaClient();

// AI generated by Claude using /route/bookings/[id] for reference (modified as well)
export async function GET(req: NextRequest) {
  const authResponse = await authenticateUser(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  const email = authResponse.headers.get('x-user-email');
  const role = authResponse.headers.get('x-user-role');
  const userId = authResponse.headers.get('x-user-id');
  if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Find user by email from token
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all bookings for this user with related data
    const bookings = await prisma.booking.findMany({
      where: { 
        userId: userId
      },
      include: {
        // Include flight booking references
        flightBookingReferences: true,
        // Include room bookings with hotel and room type information
        roomBookings: {
          include: {
            roomType: {
              select: {
                name: true,
                pricePerNight: true,
                hotel: {
                  select: {
                    name: true,
                    city: true,
                    country: true,
                    starRating: true,
                  }
                }
              }
            }
          }
        },
        // Include payment information without sensitive details
        paymentInfo: {
          select: {
            lastFourDigits: true,
            cardholderName: true,
          }
        }
      },
      orderBy: {
        bookingDate: 'desc' // Most recent bookings first
      }
    });
    
    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings
    });
    
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}