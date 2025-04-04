import React, { useState } from 'react';
import { Flight, BookingData } from '@/types';

interface FlightBookingButtonProps {
  outboundFlight: { flights: Flight[] };
  returnFlight?: { flights: Flight[] };
  isRoundTrip: boolean;
  flightSearchParams?: any;
  onBookingSelect?: (bookingData: BookingData) => void;
}

export const FlightBookingButton: React.FC<FlightBookingButtonProps> = ({
  outboundFlight,
  returnFlight,
  isRoundTrip,
  flightSearchParams,
  onBookingSelect
}) => {
  const [passportNumber, setPassportNumber] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [isShowingForm, setIsShowingForm] = useState(false);

  // Extract all flight IDs from outbound legs
  const getOutboundFlightIds = () => {
    return outboundFlight.flights.map(flight => flight.id);
  };

  // Extract all flight IDs from return legs, if applicable
  const getReturnFlightIds = () => {
    if (isRoundTrip && returnFlight && returnFlight.flights && returnFlight.flights.length > 0) {
      return returnFlight.flights.map(flight => flight.id);
    }
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get all the individual flight IDs
    const outboundFlightIds = getOutboundFlightIds();
    const returnFlightIds = getReturnFlightIds();
    
    // Combine all flight IDs into a single array
    const allFlightIds = [...outboundFlightIds, ...returnFlightIds];

    // Check if this is a round trip with no return flights available
    const noReturnFlightAvailable = isRoundTrip && returnFlightIds.length === 0;

    const bookingData: BookingData = {
      flightIds: allFlightIds,
      passportNumber,
      flightSearchParams: {
        ...flightSearchParams,
        isRoundTrip,
        noReturnFlightAvailable
      },
      returnFlight: returnFlight || undefined,
      guestCount: passengers
    };

    if (onBookingSelect) {
      onBookingSelect(bookingData);
    }
    
    setIsShowingForm(false);
  };

  return (
    <div className="mt-6">
      {!isShowingForm ? (
        <button
          onClick={() => setIsShowingForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 w-full"
        >
          Book this itinerary
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Complete Your Booking</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="passport" className="block text-sm font-medium text-gray-700">
                  Passport Number (Optional)
                </label>
                <input
                  type="text"
                  id="passport"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="passengers" className="block text-sm font-medium text-gray-700">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  id="passengers"
                  min="1"
                  max="9"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => setIsShowingForm(false)}
                className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};