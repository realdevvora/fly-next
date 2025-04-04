import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/userMiddleware';
import { NextRequest } from 'next/server';
const prisma = new PrismaClient();

/**
 * POST /api/bookings/checkout
 * Completes the booking by processing payment.
 * 
 * Expected JSON body:
 * {
 *  "bookingId": number,
 * "cardholderName": string,
 * "cardNumber": string,
 * "expiryDate": string,
 * }
 */
export async function POST(request: NextRequest) {
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
  
    try {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return NextResponse.json(
          { error: 'Malformed JSON body' },
          { status: 400 }
        );
      }
      const { bookingId, cardholderName, cardNumber, expiryDate } = body;
  
      if (!bookingId || !cardholderName || !cardNumber || !expiryDate || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields: bookingId, cardholderName, cardNumber, expiryDate, userId' },
          { status: 400 }
        );
      }

      if (typeof bookingId !== 'string' || typeof cardholderName !== 'string' || typeof cardNumber !== 'string' || typeof expiryDate !== 'string') {
        return NextResponse.json(
          { error: 'Invalid data types: bookingId must be a number, cardholderName, cardNumber, expiryDate must be strings, userId must be a number' },
          { status: 400 }
        );
      }
  
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
  
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
  
      if (booking.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not have access to this booking' }, { status: 403 });
      }

      if (booking.status === 'CONFIRMED') {
        return NextResponse.json({ error: 'Booking has already been processed' }, { status: 400 });
      }

      if (booking.status === 'CANCELLED') {
        return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 });
      }

      if (cardNumber.length !== 16) {
        return NextResponse.json({ error: 'Invalid card number' }, { status: 400 });
      }

      // card validation checks via chatgpt
      const today = new Date();
      const currentYear = today.getFullYear() % 100; // Extract last two digits
      const currentMonth = today.getMonth() + 1; // getMonth() is 0-based

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return NextResponse.json({ error: 'Invalid expiry date format' }, { status: 400 });
      }

      const [month, year] = expiryDate.split('/').map(Number);

      if (month < 1 || month > 12) {
        return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
      }

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return NextResponse.json({ error: 'Expired card' }, { status: 400 });
      }


      const lastFourDigits = cardNumber.slice(-4);
  
      // Create payment info
      const paymentInfo = await prisma.paymentInfo.create({
        data: {
          bookingId,
          cardholderName,
          lastFourDigits,
          expiryDate,
        },
      });

      if (!paymentInfo) {
        return NextResponse.json({ error: 'Error processing payment' }, { status: 400 });
      }
  
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Create notification for the affected user
      await prisma.notification.create({
        data: {
            userId: booking.userId,
            title: "Booking Confirmation",
            message: `Your booking for ${bookingId} has been confirmed!`,
            type: "BOOKING_CONFIRMATION",
            bookingId: booking.id
        }
    });
  
      return NextResponse.json(
        { message: 'Payment successful!', paymentInfo },
        { status: 200 }
      );
    } catch (error) {
      console.error('Checkout error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: (error as Error).message },
        { status: 500 }
      );
    }
  }
  