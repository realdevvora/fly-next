export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Common Hotel interface
export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  location: string;
  starRating: number;
  images: string[];
  roomTypes: RoomType[];
}

// Room Type interface
export interface RoomType {
  id: string;
  name: string;
  description?: string;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
  maxGuests: number;
  roomBookings: {
    checkInDate: string;
    checkOutDate: string;
  }[];
}

// Flight interface
export interface Flight {
  id: string;
  airline: Airline;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: Airport;
  destination: Airport;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
}

// Airline interface
export interface Airline {
  code: string;
  name: string;
  logo?: string;
}

// Unified BookingData interface that works for both flights and hotels
export interface BookingData {
  // Flight-specific fields
  flightIds: string[];
  passportNumber?: string;
  flightSearchParams?: {
    source?: string;
    sourceCode?: string;
    destination?: string;
    destinationCode?: string;
    departDate?: string;
    returnDate?: string;
    isRoundTrip?: boolean;
    isOutbound?: boolean;
    noReturnFlightAvailable?: boolean;
  };
  returnFlight?: {
    flights: Flight[];
  };
  
  // Hotel-specific fields
  hotelId?: string;
  roomTypeId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  
  // Common fields
  guestCount?: number;
}

// Hotel search params
export interface HotelSearchParams {
  city: string;
  startDate: string;
  endDate: string;
  guests: string;
  name?: string;
  starRating?: string;
  minPrice?: string;
  maxPrice?: string;
}

// Flight search params
export interface FlightSearchParams {
  source: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

export interface SearchParams {
  source: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}