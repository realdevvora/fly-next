import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { FlightBookingButton } from './FlightBookingButton';
import { BookingData } from '@/types';
import { Flight } from '@/types';

interface FlightResultsProps {
  bestOutboundFlight: { flights: Flight[] };
  bestReturnFlight?: { flights: Flight[] };
  isRoundTrip: boolean;
  flightSearchParams?: any; // Additional search parameters
  onBookingSelect?: (bookingData: BookingData) => void;
}

export default function FlightResults({ 
  bestOutboundFlight, 
  bestReturnFlight, 
  isRoundTrip, 
  flightSearchParams,
  onBookingSelect 
}: FlightResultsProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  if (!bestOutboundFlight) return null;

  // Check if return flight is valid
  const hasValidReturnFlight = isRoundTrip && 
    bestReturnFlight && 
    bestReturnFlight.flights && 
    bestReturnFlight.flights.length > 0;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleBookingSelect = (bookingData: BookingData) => {
    // If parent provided a handler, pass the booking data up
    if (onBookingSelect) {
      onBookingSelect(bookingData);
    }
  };

  const renderFlightPath = (flights: Flight[], title: string) => {
    // Ensure flights array is not empty
    if (!flights || flights.length === 0) return null;
    
    // Calculate totals for the entire path
    const totalDuration = flights.reduce((sum, flight) => sum + flight.duration, 0);
    const totalPrice = flights.reduce((sum, flight) => sum + flight.price, 0);
    const currency = flights[0].currency;

    return (
      <div className="space-y-4">
        <h3 className={`text-xl font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        <div className={`rounded-lg p-4 transition-shadow transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 shadow-gray-900/50 hover:shadow-gray-900/70'
            : 'bg-white shadow-md hover:shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {flights[0].origin.city} ({flights[0].origin.code}) → 
                {flights[flights.length - 1].destination.city} ({flights[flights.length - 1].destination.code})
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Total Duration: {formatDuration(totalDuration)}
              </div>
              {flights.length > 1 && (
                <div className={`text-xs ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {flights.length - 1} {flights.length - 1 === 1 ? 'stop' : 'stops'}
                </div>
              )}
            </div>
            <div className={`text-xl font-bold ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(totalPrice)}
            </div>
          </div>
          
          <div className={`space-y-4 mt-4 pt-4 ${
            isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'
          }`}>
            {flights.map((flight, idx) => (
              <div key={flight.id} className="flex items-center justify-between text-sm">
                <div className="space-y-2">
                  <div className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatTime(flight.departureTime)} - {flight.origin.city} ({flight.origin.code})
                  </div>
                  <div className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatTime(flight.arrivalTime)} - {flight.destination.city} ({flight.destination.code})
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {flight.airline.name} {flight.flightNumber} · {formatDuration(flight.duration)}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {flight.availableSeats} seats available
                  </div>
                </div>
                {idx < flights.length - 1 && (
                  <div className={`text-xs font-medium ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    Connection
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add a notification for when a return flight is requested but not available
  const renderNoReturnFlightNotice = () => {
    return (
      <div className="space-y-4">
        <h3 className={`text-xl font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Return Flight
        </h3>
        <div className={`rounded-lg p-4 border-2 ${
          isDark 
            ? 'bg-gray-800 border-amber-500/70 text-amber-400'
            : 'bg-amber-50 border-amber-300 text-amber-700'
        }`}>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">No returning flights available for your search criteria.</span>
          </div>
          <p className={`mt-2 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Please try different dates or destinations for your return journey.
          </p>
        </div>
      </div>
    );
  };

  if (!mounted) {
    // Return a simple loading state or skeleton UI
    return (
      <div className="space-y-8">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        {isRoundTrip && (
          <>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {bestOutboundFlight && renderFlightPath(bestOutboundFlight.flights, "Outbound Flight")}
      
      {/* Show return flight if available, otherwise show notice */}
      {isRoundTrip && (
        hasValidReturnFlight 
          ? renderFlightPath(bestReturnFlight.flights, "Return Flight")
          : renderNoReturnFlightNotice()
      )}
      
      <FlightBookingButton 
        outboundFlight={bestOutboundFlight}
        returnFlight={hasValidReturnFlight ? bestReturnFlight : undefined}
        isRoundTrip={isRoundTrip}
        flightSearchParams={flightSearchParams}
        onBookingSelect={handleBookingSelect}
      />
    </div>
  );
}