'use client';
import React, { useState, useEffect } from 'react';
import HotelSearch from '@/components/hotelComponents/HotelSearch';
import FlightsPage from '@/components/flightComponents/FlightSearchPage';
import { ItineraryProvider, useItinerary } from '@/components/contexts/ItineraryContext';
import { BookingData, Flight } from '@/types';

// Modified BookingData interface that works with separate outbound and return flights
interface ModifiedBookingData {
  // Flight IDs (for all individual flights)
  flightIds: string[];
  // Passport information
  passportNumber?: string;
  // Flight search parameters
  flightSearchParams?: {
    source: string;
    sourceCode?: string;
    destination: string;
    destinationCode?: string;
    departDate: string;
    returnDate?: string;
    isRoundTrip: boolean;
    isOutbound?: boolean; // Added to identify if this is outbound portion
    noReturnFlightAvailable?: boolean; // Added flag to track no return flight availability
  };
  // Return flight data
  returnFlight?: {
    flights: Flight[]; // Complete flight objects for the return journey
  };
  // Hotel-specific fields
  hotelId?: string;
  roomTypeId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  // Shared fields
  guestCount: number;
}

// Inner component that uses the context
const BookingItineraryInner: React.FC = () => {
  const { itineraryData, resetItinerary } = useItinerary();
  
  // Combined all booking data into a single state object
  const [bookingData, setBookingData] = useState<ModifiedBookingData>({
    flightIds: [],
    passportNumber: '',
    flightSearchParams: {
      source: '',
      destination: '',
      departDate: '',
      returnDate: '',
      isRoundTrip: false,
      noReturnFlightAvailable: false
    },
    hotelId: '',
    roomTypeId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 0,
    guestCount: 1
  });
  
  // Booking status state
  const [bookingStatus, setBookingStatus] = useState({
    isLoading: false,
    error: null as string | null,
    success: false,
    bookingId: null as string | null
  });

  // Update bookingData when itineraryData changes
  useEffect(() => {
    // Update flight-related data
    if (itineraryData.sourceAirport || itineraryData.destinationAirport) {
      setBookingData(prev => ({
        ...prev,
        flightSearchParams: {
          ...prev.flightSearchParams,
          source: itineraryData.sourceAirport?.code || prev.flightSearchParams?.source || '',
          destination: itineraryData.destinationAirport?.code || prev.flightSearchParams?.destination || '',
          departDate: itineraryData.departureDate || prev.flightSearchParams?.departDate || new Date().toISOString().split('T')[0],
          returnDate: itineraryData.returnDate || prev.flightSearchParams?.returnDate || new Date().toISOString().split('T')[0],
          isRoundTrip: !!itineraryData.returnDate
        }
      }));
    }
    
    // Update hotel-related data
    if (itineraryData.checkInDate || itineraryData.checkOutDate) {
      setBookingData(prev => ({
        ...prev,
        checkInDate: itineraryData.checkInDate || prev.checkInDate,
        checkOutDate: itineraryData.checkOutDate || prev.checkOutDate
      }));
    }
    
    // Update shared data
    if (itineraryData.guestCount) {
      setBookingData(prev => ({
        ...prev,
        guestCount: itineraryData.guestCount || prev.guestCount
      }));
    }
  }, [itineraryData]);

  // Handler for flight booking data
  const handleFlightBooking = (data: any) => {
    // Store all individual flight IDs
    const flightIds = data.flightIds || [];
    
    // Determine if there's no return flight available
    // This happens when isRoundTrip is true but we only received outbound flight IDs
    const isRoundTrip = data.flightSearchParams?.isRoundTrip;
    const noReturnFlightAvailable = isRoundTrip && data.flightSearchParams?.noReturnFlightAvailable;
    
    setBookingData((prev: any) => ({
      ...prev,
      flightIds,
      passportNumber: data.passportNumber || prev.passportNumber,
      flightSearchParams: {
        ...(data.flightSearchParams || prev.flightSearchParams),
        isRoundTrip,
        noReturnFlightAvailable
      },
      returnFlight: data.returnFlight, // Store the return flight data
      ...(data.guestCount ? { guestCount: data.guestCount } : {})
    }));
  };

  // Handler for hotel booking data
  const handleHotelBooking = (data: Partial<BookingData>) => {
    setBookingData(prev => ({
      ...prev,
      hotelId: data.hotelId || prev.hotelId,
      roomTypeId: data.roomTypeId || prev.roomTypeId,
      checkInDate: data.checkInDate || prev.checkInDate,
      checkOutDate: data.checkOutDate || prev.checkOutDate,
      numberOfRooms: data.numberOfRooms || prev.numberOfRooms,
      // Update guest count only if provided from hotel component
      ...(data.guestCount ? { guestCount: data.guestCount } : {})
    }));
  };

  // Submit the booking with separate flight bookings
  const submitBooking = async () => {
    // Validation
    if (bookingData.flightIds.length === 0 && !bookingData.hotelId) {
      alert('Please select at least a flight or hotel');
      return;
    }

    setBookingStatus({
      isLoading: true,
      error: null,
      success: false,
      bookingId: null
    });

    try {
      // Create an array of booking requests
      const bookingRequests = [];
      
      // Add flight bookings
      if (bookingData.flightIds.length > 0) {
        // Get flight search parameters
        const flightSearchParams = bookingData.flightSearchParams;
        const isRoundTrip = flightSearchParams?.isRoundTrip || false;
        
        if (isRoundTrip && bookingData.returnFlight) {
          // For round trips, we need to separate outbound and return flights
          const outboundIds = [];
          const returnIds = [];
          
          // Split flight IDs into outbound and return
          const totalFlights = bookingData.flightIds.length;
          const hasSeparateReturnFlightData = bookingData.returnFlight.flights && bookingData.returnFlight.flights.length > 0;
          
          if (hasSeparateReturnFlightData) {
            // We have specific return flight data
            const outboundCount = bookingData.flightIds.length - bookingData.returnFlight.flights.length;
            
            for (let i = 0; i < bookingData.flightIds.length; i++) {
              if (i < outboundCount) {
                outboundIds.push(bookingData.flightIds[i]);
              } else {
                returnIds.push(bookingData.flightIds[i]);
              }
            }
          } else if (!bookingData?.flightSearchParams?.noReturnFlightAvailable) {
            // If no specific return data but we have round trip, approximate division
            const midpoint = Math.ceil(totalFlights / 2);
            
            for (let i = 0; i < totalFlights; i++) {
              if (i < midpoint) {
                outboundIds.push(bookingData.flightIds[i]);
              } else {
                returnIds.push(bookingData.flightIds[i]);
              }
            }
          } else {
            // No return flight available, all flights are outbound
            outboundIds.push(...bookingData.flightIds);
          }
          
          // Create outbound flight booking
          if (outboundIds.length > 0) {
            bookingRequests.push({
              type: 'flight',
              flightIds: outboundIds,
              passportNumber: bookingData.passportNumber,
              flightSearchParams: {
                ...flightSearchParams,
                isOutbound: true
              },
              guestCount: bookingData.guestCount
            });
          }
          
          // Create return flight booking if we have return flights
          if (returnIds.length > 0) {
            bookingRequests.push({
              type: 'flight',
              flightIds: returnIds,
              passportNumber: bookingData.passportNumber,
              flightSearchParams: {
                ...flightSearchParams,
                isOutbound: false
              },
              guestCount: bookingData.guestCount
            });
          }
        } else {
          // For one-way trips or when no return flight is available
          bookingRequests.push({
            type: 'flight',
            flightIds: bookingData.flightIds,
            passportNumber: bookingData.passportNumber,
            flightSearchParams: {
              ...flightSearchParams,
              isRoundTrip: false
            },
            guestCount: bookingData.guestCount
          });
        }
      }
      
      // Add hotel booking if selected
      if (bookingData.hotelId) {
        bookingRequests.push({
          type: 'hotel',
          hotelId: bookingData.hotelId,
          roomTypeId: bookingData.roomTypeId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          numberOfRooms: bookingData.numberOfRooms,
          guestCount: bookingData.guestCount
        });
      }
      
      // Make separate API calls for each booking
      const bookingResponses = await Promise.all(
        bookingRequests.map(request => 
          fetch('/api/bookings/itinerary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          }).then(res => res.json())
        )
      );
      
      // Check if all bookings were successful
      const hasError = bookingResponses.some(response => response.error);
      
      if (hasError) {
        const errorMessages = bookingResponses
          .filter(response => response.error)
          .map(response => response.error)
          .join(', ');
        throw new Error(`Booking failed: ${errorMessages}`);
      }
      
      // Get the booking IDs
      const bookingIds = bookingResponses.map(response => response.bookingId).join(', ');
      
      setBookingStatus({
        isLoading: false,
        error: null,
        success: true,
        bookingId: bookingIds
      });
      
      // Reset itinerary after successful booking
      resetItinerary();
    } catch (err) {
      setBookingStatus({
        isLoading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
        success: false,
        bookingId: null
      });
    }
  };

  const handleResetBooking = () => {
    setBookingData({
      flightIds: [],
      passportNumber: '',
      flightSearchParams: {
        source: '',
        destination: '',
        departDate: '',
        returnDate: '',
        isRoundTrip: false,
        noReturnFlightAvailable: false
      },
      hotelId: '',
      roomTypeId: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfRooms: 0,
      guestCount: 1
    });
    
    // Reset status
    setBookingStatus({
      isLoading: false,
      error: null,
      success: false,
      bookingId: null
    });
    
    // Reset itinerary context
    resetItinerary();
  };

  // Helper function to determine if a booking option is selected
  const hasFlightsSelected = bookingData.flightIds.length > 0;
  const hasHotelSelected = Boolean(bookingData.hotelId);

  // Helper to get outbound and return flights for display purposes
  const getOutboundFlights = () => {
    if (!hasFlightsSelected || !bookingData.flightSearchParams) return [];
    
    const isRoundTrip = bookingData.flightSearchParams.isRoundTrip;
    
    if (isRoundTrip && bookingData.returnFlight && bookingData.returnFlight.flights) {
      // If we have specific return flight data, subtract from total
      const outboundCount = bookingData.flightIds.length - bookingData.returnFlight.flights.length;
      return Array(outboundCount).fill(null);
    } else if (isRoundTrip && !bookingData.flightSearchParams.noReturnFlightAvailable) {
      // If round trip but no specific return data (and return is available), split evenly
      const outboundCount = Math.ceil(bookingData.flightIds.length / 2);
      return Array(outboundCount).fill(null);
    } else {
      // For one-way trips or when no return is available, all flights are outbound
      return Array(bookingData.flightIds.length).fill(null);
    }
  };

  const getReturnFlights = () => {
    if (!hasFlightsSelected || 
        !bookingData.flightSearchParams?.isRoundTrip || 
        bookingData.flightSearchParams?.noReturnFlightAvailable) {
      return [];
    }
    
    if (bookingData.returnFlight && bookingData.returnFlight.flights) {
      // If we have specific return flight data
      return Array(bookingData.returnFlight.flights.length).fill(null);
    } else {
      // Otherwise approximate
      const returnCount = Math.floor(bookingData.flightIds.length / 2);
      return Array(returnCount).fill(null);
    }
  };

  const outboundFlights = getOutboundFlights();
  const returnFlights = getReturnFlights();
  const hasOutboundFlightsSelected = outboundFlights.length > 0;
  const hasReturnFlightsSelected = returnFlights.length > 0;
  const isRoundTripWithNoReturn = 
    bookingData.flightSearchParams?.isRoundTrip && 
    bookingData.flightSearchParams?.noReturnFlightAvailable;

  return (
    <div className="container mx-auto px-4 py-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Plan Your Trip</h1>
      
      {/* Status Messages */}
      {bookingStatus.isLoading && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
          <p>Processing your booking...</p>
        </div>
      )}
      {bookingStatus.success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 p-3 rounded">
          <p>Booking successful! ID(s): {bookingStatus.bookingId}</p>
          <button 
            onClick={handleResetBooking}
            className="mt-2 px-4 py-1 text-sm bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700"
          >
            Book Another Trip
          </button>
        </div>
      )}
      {bookingStatus.error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 p-3 rounded">
          <p>{bookingStatus.error}</p>
        </div>
      )}
      
      {/* Tabs for Hotel and Flight */}
      <div className="mb-6">
        <div className="border-b dark:border-gray-700">
          <nav className="flex space-x-4">
            <button
              className="py-2 px-4 border-b-2 border-blue-500 dark:border-blue-400 font-medium"
            >
              Book Hotel & Flight
            </button>
          </nav>
        </div>
      </div>
      
      {/* Itinerary Summary - Show at top if there's selections */}
      {(hasOutboundFlightsSelected || hasReturnFlightsSelected || hasHotelSelected) && (
        <div className="bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Your Selections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Outbound Flight Summary */}
            <div className={hasOutboundFlightsSelected 
              ? "bg-green-50 dark:bg-green-900/30 p-3 rounded" 
              : "bg-gray-50 dark:bg-gray-700 p-3 rounded"}>
              <h3 className="font-medium">Outbound Flight</h3>
              {hasOutboundFlightsSelected ? (
                <>
                  <p className="text-sm mt-1">
                    {bookingData.flightSearchParams?.source} → {bookingData.flightSearchParams?.destination}
                  </p>
                  <p className="text-sm">Departure: {bookingData.flightSearchParams?.departDate}</p>
                  <p className="text-sm">Passengers: {bookingData.guestCount}</p>
                  <p className="text-sm">Flights: {outboundFlights.length}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No outbound flight selected</p>
              )}
            </div>
            
            {/* Return Flight Summary */}
            <div className={
              hasReturnFlightsSelected 
                ? "bg-green-50 dark:bg-green-900/30 p-3 rounded" 
                : isRoundTripWithNoReturn
                  ? "bg-amber-50 dark:bg-amber-900/30 p-3 rounded border border-amber-300 dark:border-amber-700"
                  : "bg-gray-50 dark:bg-gray-700 p-3 rounded"
            }>
              <h3 className="font-medium">Return Flight</h3>
              {hasReturnFlightsSelected ? (
                <>
                  <p className="text-sm mt-1">
                    {bookingData.flightSearchParams?.destination} → {bookingData.flightSearchParams?.source}
                  </p>
                  <p className="text-sm">Departure: {bookingData.flightSearchParams?.returnDate}</p>
                  <p className="text-sm">Passengers: {bookingData.guestCount}</p>
                  <p className="text-sm">Flights: {returnFlights.length}</p>
                </>
              ) : isRoundTripWithNoReturn ? (
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">No return flights available for selected dates</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No return flight selected</p>
              )}
            </div>
            
            {/* Hotel Summary */}
            <div className={hasHotelSelected 
              ? "bg-green-50 dark:bg-green-900/30 p-3 rounded" 
              : "bg-gray-50 dark:bg-gray-700 p-3 rounded"}>
              <h3 className="font-medium">Hotel</h3>
              {hasHotelSelected ? (
                <>
                  <p className="text-sm mt-1">{bookingData.checkInDate} → {bookingData.checkOutDate}</p>
                  <p className="text-sm">Rooms: {bookingData.numberOfRooms}, Guests: {bookingData.guestCount}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No hotel selected</p>
              )}
            </div>
          </div>
          
          {/* Book and Reset buttons */}
          <div className="flex mt-4 space-x-4">
            <button
              onClick={submitBooking}
              disabled={bookingStatus.isLoading || (!hasFlightsSelected && !hasHotelSelected)}
              className={`px-4 py-2 rounded font-medium ${
                bookingStatus.isLoading || (!hasFlightsSelected && !hasHotelSelected)
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {bookingStatus.isLoading ? 'Processing...' : 'Book Now'}
            </button>
            
            <button
              onClick={handleResetBooking}
              className="px-4 py-2 rounded font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      
      {/* Search Components - Vertical layout */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="rounded shadow dark:shadow-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-3">Flight</h2>
          <FlightsPage onBookFlight={handleFlightBooking} />
        </div>
        <div className="rounded shadow dark:shadow-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-3">Hotel</h2>
          <HotelSearch onBookRoom={handleHotelBooking} />
        </div>
      </div>
    </div>
  );
};

// Wrapper component that provides the context
const BookingItinerary: React.FC = () => {
  return (
    <ItineraryProvider>
      <BookingItineraryInner />
    </ItineraryProvider>
  );
};

export default BookingItinerary;