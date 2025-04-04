import { NextResponse } from 'next/server';
import { PrismaClient, Booking, FlightBookingReference, RoomBooking, User } from '@prisma/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { authenticateUser } from '@/lib/userMiddleware';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

interface BookingWithDetails extends Booking {
  flightBookingReferences: FlightBookingReference[];
  roomBookings: RoomBooking[];
  user: User;
}

type tParams = Promise<{ id: string }>;

/**
 * GET /api/bookings/[id]/invoice
 * Generates a PDF invoice for the booking.
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
    const booking: BookingWithDetails | null = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBookingReferences: true,
        roomBookings: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pdfBytes = await generateInvoicePDF(booking);

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${bookingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generates a PDF invoice for the given booking.
 */
async function generateInvoicePDF(booking: BookingWithDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const lineHeight = 15;
  const margin = 50;
  let y = page.getHeight() - margin;

  page.drawText('Invoice', {
    x: margin,
    y,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  page.drawText(`Booking ID: ${booking.id}`, {
    x: margin,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`User: ${booking.user.firstName} ${booking.user.lastName}`, {
    x: margin,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Total Price: $${booking.totalPrice.toFixed(2)}`, {
    x: margin,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  if (booking.flightBookingReferences.length > 0) {
    page.drawText('Flight Details:', {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;

    booking.flightBookingReferences.forEach((flight) => {
      page.drawText(`- Flight Booking ID: ${flight.afsBookingId}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      page.drawText(`  Passenger Count: ${flight.passengerCount}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      page.drawText(`  Total Price: $${flight.totalPrice.toFixed(2)}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    });

    y -= lineHeight;
  }

  if (booking.roomBookings.length > 0) {
    page.drawText('Room Details:', {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;

    booking.roomBookings.forEach((room) => {
      page.drawText(`- Room Type ID: ${room.roomTypeId}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      page.drawText(`  Check-In: ${new Date(room.checkInDate).toLocaleDateString()}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      page.drawText(`  Check-Out: ${new Date(room.checkOutDate).toLocaleDateString()}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;

      page.drawText(`  Total Price: $${room.totalPrice.toFixed(2)}`, {
        x: margin + 20,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    });
  }

  return pdfDoc.save();
}
