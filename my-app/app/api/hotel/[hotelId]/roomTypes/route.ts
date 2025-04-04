import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';

const prisma = new PrismaClient();

// The correct way to type Next.js App Router route handlers
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  const authResponse = await authenticateUser(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  const decodedEmail = authResponse.headers.get('x-user-email');
  if (!decodedEmail) {
    return NextResponse.json({ error: 'User email not found in token' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ownerId = user.id;
    const hotelId = (await params).hotelId;

    if (!hotelId) {
      return NextResponse.json(
        { error: "Missing hotelId parameter" },
        { status: 400 }
      );
    }

    // Verify hotel exists and belongs to the user
    const hotel = await prisma.hotel.findUnique({
      where: {
        id: hotelId,
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (ownerId !== hotel.ownerId) {
      return NextResponse.json(
        { error: "You do not have permission to access this hotel's room types" },
        { status: 403 }
      );
    }

    // Fetch all room types for the specified hotel
    const roomTypes = await prisma.roomType.findMany({
      where: {
        hotelId: hotelId
      },
      select: {
        id: true,
        name: true,
        description: true,
        pricePerNight: true,
        totalRooms: true,
        amenities: true,
        images: true,
      }
    });

    return NextResponse.json({ roomTypes }, { status: 200 });
  }
  catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}