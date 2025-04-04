import { PrismaClient, NotificationType } from '@prisma/client'
import { authenticateUser } from '@/lib/userMiddleware'
import { NextResponse, NextRequest } from 'next/server'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
      return authResponse; // Stop execution if authentication fails
    }
    // Extract the user data from authResponse
    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: email },
    })
    // Check if user exists
    if (!user) {
      return NextResponse.json({ message: 'Forbidden: User not found' }, { status: 403 })
    }

    // Check if the user owns any hotels
    const userHotels = await prisma.hotel.findMany({
      where: {
        ownerId: user?.id
      },
      select: {
        id: true
      }
    });
    
    const hotelIds = userHotels.map((hotel: any) => hotel.id);
    if (hotelIds.length === 0) {
      return NextResponse.json({
        notifications: [],
        pagination: {
          total: 0,
          hasMore: false,
        },
        unreadCount: 0,
      });
    }

    // Find all bookings related to the user's hotels
    const hotelBookings = await prisma.roomBooking.findMany({
      where: {
        hotelId: {
          in: hotelIds
        }
      },
      select: {
        bookingId: true
      }
    });
    const bookingIds = [...new Set(hotelBookings.map(booking => booking.bookingId))];

    // Build the query for notifications related to bookings at user's hotels
    const whereClause = {
      type: NotificationType.HOTEL_NEW_BOOKING,
      bookingId: {
        in: bookingIds
      }
    }

    // Get notifications count
    const totalCount = await prisma.notification.count({
      where: whereClause,
    })

    // Get the notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        booking: {
          include: {
            roomBookings: {
              include: {
                roomType: true,
                hotel: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true
                  }
                },
              },
              where: {
                hotelId: {
                  in: hotelIds
                }
              }
            },
          },
        },
      },
    })

    // Get unread count for badge display
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    })

    // Return notifications with metadata
    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        hasMore: false,
      },
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching hotel owner notifications:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}