import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/userMiddleware';
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Define interfaces at the module level, not inside functions
interface RoomBookingData {
  roomType: string;
  hotel: {
    name: string;
    id: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  numberOfRooms: number;
  pricePerNight: number;
  price: number;
}

interface FlightBookingData {
  bookingId: string;
  bookingReference?: string;
  ticketNumber?: string;
  price: number;
  flights?: any[];
}

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error']
});

export async function POST(request: NextRequest): Promise<Response> {
  // Use a transaction to ensure all database operations are atomic
  const authResponse = await authenticateUser(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }
  const email = authResponse.headers.get('x-user-email');
  const role = authResponse.headers.get('x-user-role');
  const userId = authResponse.headers.get('x-user-id');

  if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: "Malformed JSON in request body." }, { status: 400 });
    }
    const { 
      flightIds, 
      roomTypeId, 
      checkInDate, 
      checkOutDate,
      passportNumber,
      numberOfRooms,
      guestCount,
      flightSearchParams,
      hotelId
    } = body;
    // Validate data types (VIA COPILOT)
    if (flightIds && !Array.isArray(flightIds)) {
      return NextResponse.json({ error: "flightIds must be an array." }, { status: 400 });
    }
    if (guestCount !== undefined && typeof guestCount !== 'number') {
      return NextResponse.json({ error: "guestCount must be an integer." }, { status: 400 });
    }
    if (numberOfRooms !== undefined && typeof numberOfRooms !== 'number') {
      return NextResponse.json({ error: "numberOfRooms must be an integer." }, { status: 400 });
    }
    
    // Only validate string fields when they're provided
    const stringFields: Record<string, string | undefined> = { 
      roomTypeId, 
      checkInDate, 
      checkOutDate, 
      passportNumber, 
      hotelId 
    };
    
    for (const [key, value] of Object.entries(stringFields)) {
      if (value !== undefined && typeof value !== 'string') {
        return NextResponse.json({ error: `${key} must be a string.` }, { status: 400 });
      }
    }
    
    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!userExists) {
      return NextResponse.json({ 
        error: "The user account could not be found. Please log in again or create an account." 
      }, { status: 400 });
    }   
    
    const firstName = userExists.firstName;
    const lastName = userExists.lastName;
    const userIdFromDb = userExists.id; 

    if ((!flightIds || flightIds.length === 0) && !roomTypeId) {
      return NextResponse.json({ error: "At least one flight or room must be selected." }, { status: 400 });
    }
    
    if (roomTypeId) {
      if (!checkInDate || !checkOutDate) {
        return NextResponse.json({ 
          error: "Check-in and check-out dates are required for room bookings." 
        }, { status: 400 });
      }
    
      if (!hotelId) {
        return NextResponse.json({
          error: "Hotel ID is required for room bookings." 
        }, { status: 400 });
      }

      const hotelExists = await prisma.hotel.findUnique({
        where: { id: hotelId },
        select: { id: true }
      });
      
      if (!hotelExists) {
        return NextResponse.json({ 
          error: "The selected hotel does not exist." 
        }, { status: 400 });
      }
      
      const roomTypeExists = await prisma.roomType.findFirst({
        where: { 
          id: roomTypeId,
          hotelId: hotelId
        },
        select: { id: true }
      });
      
      if (!roomTypeExists) {
        return NextResponse.json({ 
          error: "The selected room type does not belong to the selected hotel." 
        }, { status: 400 });
      }
    }

    if (flightIds && flightIds.length > 0) {
      if (!passportNumber) {
        return NextResponse.json({ 
          error: "Passport number is required for flight bookings." 
        }, { status: 400 });
      }
    }
    
    let totalPrice = 0;
    let flightBookingData: FlightBookingData | null = null;
    let roomBookingData: RoomBookingData | null = null;
    let flightSearchParamsJson = flightSearchParams ? JSON.stringify(flightSearchParams) : null;
    
    if (roomTypeId && checkInDate && checkOutDate && hotelId) {
      const roomResult = await handleRoomBooking(
        roomTypeId, 
        checkInDate, 
        checkOutDate, 
        numberOfRooms || 1, 
        hotelId
      );
      
      if (roomResult.error) return roomResult.response || NextResponse.json({ error: "Unknown room booking error." }, { status: 500 });
      roomBookingData = roomResult.data ? roomResult.data : null;
      totalPrice += roomResult.price || 0;
    }

    if (flightIds && flightIds.length > 0 && passportNumber) {
      const flightResult = await handleFlightBooking(flightIds, firstName, lastName, email, passportNumber);
      if (flightResult.error) return flightResult.response || NextResponse.json({ error: "Unknown flight booking error." }, { status: 500 });
      flightBookingData = flightResult.data;
      totalPrice += flightResult.price || 0;
    }
    
    // Create a Response object outside of the transaction
    // The problematic line and fix:
    let transactionResult = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create the main booking record
      const booking = await tx.booking.create({
        data: {
          user: {
            connect: { id: userIdFromDb }
          },
          totalPrice,
          status: 'PENDING',
          flightSearchParams: flightSearchParamsJson || null,
        }
      });

      // Track if we need both bookings
      const needsRoomBooking: boolean = !!roomBookingData;
      const needsFlightBooking: boolean = !!flightBookingData;
      let roomBookingCreated: boolean = false;
      let flightBookingCreated: boolean = false;
      
      if (needsRoomBooking && roomBookingData) {
        // Validate hotel ID is available in the data
        if (!roomBookingData.hotel || !roomBookingData.hotel.id) {
          throw new Error("Missing hotel information for room booking");
        }
        
        // Verify the hotel exists in the database
        const hotelExists = await tx.hotel.findUnique({
          where: { id: roomBookingData.hotel.id },
          select: { id: true }
        });
        
        if (!hotelExists) {
          throw new Error("Invalid hotel ID for room booking");
        }
        
        await tx.roomBooking.create({
          data: {
            bookingId: booking.id,
            roomTypeId,
            hotelId: roomBookingData.hotel.id,
            checkInDate: new Date(roomBookingData.checkIn),
            checkOutDate: new Date(roomBookingData.checkOut),
            guestCount: guestCount || 1,
            totalPrice: roomBookingData.price
          }
        });
        roomBookingCreated = true;
      }
      
      // Add flight booking reference if flight was booked
      if (needsFlightBooking && flightBookingData) {
        const afsBookingId: string = flightBookingData.bookingId ||
          flightBookingData.bookingReference ||
          flightBookingData.ticketNumber ||
          `manual-${Date.now()}`;
          
        await tx.flightBookingReference.create({
          data: {
            bookingId: booking.id,
            afsBookingId: afsBookingId,
            passengerCount: guestCount || 1,
            totalPrice: parseFloat(String(flightBookingData.price || 0)),
            isRoundTrip: flightIds.length > 1
          }
        });
        flightBookingCreated = true;
      }
      
      // Validate that both required bookings were created
      if ((needsRoomBooking && !roomBookingCreated) || 
          (needsFlightBooking && !flightBookingCreated)) {
        throw new Error("Required booking components failed to be created");
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: "New Booking",
          message: `Your booking #${booking.id} has been made.`,
          type: "HOTEL_NEW_BOOKING",
          bookingId: booking.id  // Add this line to link the notification to the booking
        }
      });

      // Return the booking data, not a Response object
      return {
        message: "Booking successful!",
        bookingId: booking.id,
        flight: flightBookingData,
        roomBooking: roomBookingData,
        totalPrice,
      };
    });

    // Convert transaction result to a proper Response object outside the transaction
    return NextResponse.json(transactionResult);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Unexpected error", details: (error as Error).message }, { status: 500 });
  }
}

async function handleFlightBooking(flightIds: string[], firstName: string, lastName: string, email: string, passportNumber: string) {
  if (!passportNumber || passportNumber.length < 9) {
    return { error: true, response: NextResponse.json({ error: "Valid passport number required." }, { status: 400 }) };
  }
  try {
    const response = await fetch('https://advanced-flights-system.replit.app/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.FLIGHT_API_KEY || '' },
      body: JSON.stringify({ firstName, lastName, email, passportNumber, flightIds })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("Flight booking error:", errorData);
      return { 
        error: true, 
        response: NextResponse.json({ 
          error: "Flight booking failed.", 
          details: errorData.message || "API request failed" 
        }, { status: 400 }) 
      };
    }
    
    const data = await response.json();
    
    // Make sure we have the bookingReference or other ID field to use as afsBookingId
    if (!data.bookingReference && !data.ticketNumber) {
      return { error: true, response: NextResponse.json({ error: "Invalid flight booking response." }, { status: 400 }) };
    }
    
    return { 
      error: false, 
      data: {
        ...data,
        bookingId: data.bookingReference || data.ticketNumber,
        price: data.price || calculateFlightPrice(data.flights || [])
      },
      price: parseFloat(String(data.price || calculateFlightPrice(data.flights || [])))
    };
  } catch (error) {
    return { error: true, response: NextResponse.json({ error: "Flight booking error.", details: (error as Error).message }, { status: 500 }) };
  }
}

// Helper function to calculate flight price if not provided directly
function calculateFlightPrice(flights: any[]) {
  return flights.reduce((total: number, flight: any) => total + (parseFloat(String(flight.price)) || 0), 0);
}

async function handleRoomBooking(roomTypeId: string, checkInDate: string, checkOutDate: string, numberOfRooms: number, hotelId: string) {
  if (!checkInDate || !checkOutDate) {
    return { error: true, response: NextResponse.json({ error: "Check-in and check-out dates required." }, { status: 400 }) };
  }
  try {
    const roomType = await prisma.roomType.findUnique({ 
      where: { id: roomTypeId }, 
      include: { hotel: true } 
    });
    
    if (!roomType) {
      return { error: true, response: NextResponse.json({ error: "Invalid room type." }, { status: 400 }) };
    }
    
    // Validate hotel exists
    if (!roomType.hotel || !roomType.hotel.id) {
      return { error: true, response: NextResponse.json({ error: "Invalid hotel information for this room type." }, { status: 400 }) };
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return { error: true, response: NextResponse.json({ error: "Invalid date format." }, { status: 400 }) };
    }
    
    if (checkIn >= checkOut) {
      return { error: true, response: NextResponse.json({ error: "Check-out date must be after check-in date." }, { status: 400 }) };
    }
    
    // Improved overlapping bookings query to accurately check for all overlap cases
    const overlappingBookings = await prisma.roomBooking.count({
      where: {
        roomTypeId,
        AND: [
          {
            NOT: {
              OR: [
                { checkOutDate: { lte: checkIn } },  // Booking ends before our check-in
                { checkInDate: { gte: checkOut } }   // Booking starts after our check-out
              ]
            }
          }
        ]
      }
    });    
    
    const roomsToBook = numberOfRooms || 1;
    if (overlappingBookings + roomsToBook > roomType.totalRooms) {
      return { error: true, response: NextResponse.json({ error: "Not enough rooms available for the selected dates." }, { status: 400 }) };
    }
    
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const price = roomType.pricePerNight * nights * roomsToBook;
    
    return { 
      error: false, 
      data: {
        roomType: roomType.name,
        hotel: {
          name: roomType.hotel.name,
          id: roomType.hotel.id
        },
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        numberOfRooms: roomsToBook,
        pricePerNight: roomType.pricePerNight,
        price
      }, 
      price 
    };
  } catch (error) {
    return { error: true, response: NextResponse.json({ error: "Room booking error.", details: (error as Error).message }, { status: 500 }) };
  }
}