'use client';
import React, { useState } from 'react';
import SearchForm from './SearchForm';
import {BookingData} from "@/types";

interface FlightsPageProps {
  onBookFlight?: (bookingData: BookingData) => void;
}

const FlightsPage: React.FC<FlightsPageProps> = ({ onBookFlight }) => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [bookingStatus, setBookingStatus] = useState<{
    isProcessing: boolean;
    success: boolean;
    error: string | null;
    bookingId: string | null;
  }>({
    isProcessing: false,
    success: false,
    error: null,
    bookingId: null
  });

  // Handle booking data from SearchForm
  const handleBookingData = (data: BookingData) => {
    console.log('Flight booking data received in FlightsPage:', data);
    
    // Ensure the data has all necessary properties for correct processing
    const enhancedData: BookingData = {
      ...data,
      flightSearchParams: {
        ...data.flightSearchParams,
        isRoundTrip: !!data.flightSearchParams?.returnDate,
        noReturnFlightAvailable: data.flightSearchParams?.isRoundTrip && 
          (!data.returnFlight || !data.returnFlight.flights || data.returnFlight.flights.length === 0)
      }
    };
    
    setBookingData(enhancedData);
    
    // If parent component provided a handler, pass the data up
    if (onBookFlight) {
      onBookFlight(enhancedData);
    } else {
      // If no parent handler, process the booking here
      handleBookingSubmit(enhancedData);
    }
  };

  // Process booking if no parent handler exists
  const handleBookingSubmit = async (data: BookingData) => {
    setBookingStatus({
      isProcessing: true,
      success: false,
      error: null,
      bookingId: null
    });

    try {
      // Create separate requests for outbound and return flights if this is a round trip
      const requests = [];
      
      if (data.flightSearchParams?.isRoundTrip && data.returnFlight && 
          data.returnFlight.flights && data.returnFlight.flights.length > 0) {
        
        // Get all flight IDs
        const allFlightIds = [...data.flightIds];
        
        // Calculate how many flights are for outbound vs return
        const returnFlightCount = data.returnFlight.flights.length;
        const outboundFlightCount = allFlightIds.length - returnFlightCount;
        
        // Create outbound booking request
        const outboundRequest = {
          type: 'flight',
          flightIds: allFlightIds.slice(0, outboundFlightCount),
          passportNumber: data.passportNumber,
          flightSearchParams: {
            ...data.flightSearchParams,
            isOutbound: true
          },
          guestCount: data.guestCount
        };
        
        // Create return booking request
        const returnRequest = {
          type: 'flight',
          flightIds: allFlightIds.slice(outboundFlightCount),
          passportNumber: data.passportNumber,
          flightSearchParams: {
            ...data.flightSearchParams,
            isOutbound: false
          },
          guestCount: data.guestCount
        };
        
        requests.push(outboundRequest, returnRequest);
      } else {
        // Single flight booking (either one-way or no return flights available)
        requests.push({
          ...data,
          type: 'flight',
          flightSearchParams: {
            ...data.flightSearchParams,
            isRoundTrip: data.flightSearchParams?.isRoundTrip && !data.flightSearchParams?.noReturnFlightAvailable
          }
        });
      }
      
      // Process all booking requests
      const responses = await Promise.all(
        requests.map(request => 
          fetch('/api/bookings/itinerary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
          }).then(res => res.json())
        )
      );
      
      // Check for errors
      const hasError = responses.some(response => response.error);
      
      if (hasError) {
        const errorMessages = responses
          .filter(response => response.error)
          .map(response => response.error)
          .join(', ');
        throw new Error(errorMessages || 'Failed to book flight');
      }
      
      // Get booking IDs
      const bookingIds = responses.map(response => response.bookingId).join(', ');

      setBookingStatus({
        isProcessing: false,
        success: true,
        error: null,
        bookingId: bookingIds
      });

      // Display success message or redirect
      console.log('Flight booking successful:', responses);
    } catch (err) {
      setBookingStatus({
        isProcessing: false,
        success: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        bookingId: null
      });
    }
  };

  return (
      <div className="flex min-h-screen flex-col text-gray-900 dark:text-gray-100">
        <main className="flex-grow">
          <div className="min-h-screen py-8 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Status Messages */}
              {bookingStatus.isProcessing && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 p-4">
                  <p className="text-blue-700 dark:text-blue-300">Processing your flight booking...</p>
                </div>
              )}
              
              {bookingStatus.success && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 p-4">
                  <p className="text-green-700 dark:text-green-300">
                    Flight booked successfully! Booking ID: {bookingStatus.bookingId}
                  </p>
                </div>
              )}
              
              {bookingStatus.error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4">
                  <p className="text-red-700 dark:text-red-300">{bookingStatus.error}</p>
                </div>
              )}
              
              <div className="shadow dark:shadow-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
                <SearchForm onBookingSelect={handleBookingData} />
              </div>
              
              {/* Optional: Display booking summary */}
              {bookingData && !bookingStatus.isProcessing && !bookingStatus.success && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Booking Summary</h2>
                  <p>Flight IDs: {bookingData.flightIds.join(', ')}</p>
                  <p>Passengers: {bookingData.guestCount}</p>
                  {bookingData.flightSearchParams && (
                    <>
                      <p>From: {bookingData.flightSearchParams.source || 'N/A'}</p>
                      <p>To: {bookingData.flightSearchParams.destination || 'N/A'}</p>
                      <p>Departure: {bookingData.flightSearchParams.departDate || 'N/A'}</p>
                      {bookingData.flightSearchParams.returnDate && (
                        <p>Return: {bookingData.flightSearchParams.returnDate}</p>
                      )}
                      {bookingData.flightSearchParams.isRoundTrip && bookingData.flightSearchParams.noReturnFlightAvailable && (
                        <p className="text-amber-600 dark:text-amber-400">Note: No return flights available for selected dates.</p>
                      )}
                    </>
                  )}
                  
                  {/* Show return flight details if available */}
                  {bookingData.returnFlight && bookingData.returnFlight.flights && bookingData.returnFlight.flights.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Return Flight Details:</p>
                      <p>Number of flights: {bookingData.returnFlight.flights.length}</p>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </main>
      </div>
  );
};

export default FlightsPage;