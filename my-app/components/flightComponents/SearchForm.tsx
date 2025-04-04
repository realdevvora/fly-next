'use client';

import React, { useState, useEffect } from 'react';
import Button from '../Button';
import FlightSearchInput from '@/components/flightComponents/FlightSearchInput';
import FlightResults from '@/components/flightComponents/FlightResults';
import { useItinerary } from '@/components/contexts/ItineraryContext';
import { BookingData, Airport, SearchParams } from '@/types';

interface SearchFormProps {
  className?: string;
  onBookingSelect: (bookingData: BookingData) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  className = '', 
  onBookingSelect 
}) => {
  // Use the itinerary context
  const { itineraryData, updateFlightData, syncItineraryData } = useItinerary();

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedSource, setSelectedSource] = useState<Airport>();
  const [selectedDestination, setSelectedDestination] = useState<Airport>();
  const [flightResults, setFlightResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Update form when itinerary data changes from hotel component
  useEffect(() => {
    if (itineraryData.lastUpdatedBy === 'hotel') {
      // If hotel data was updated, sync it to flight search
      if (itineraryData.checkInDate) {
        setDepartDate(itineraryData.checkInDate);
      }
      
      if (itineraryData.checkOutDate) {
        setReturnDate(itineraryData.checkOutDate);
      }
      
      // We don't update source/destination based on hotel city
      // as that would require additional airport lookup functionality
    }
  }, [itineraryData]);

  // Handle source change with context update
  const handleSourceChange = (value: string, airport?: Airport) => {
    setSource(value);
    if (airport) {
      setSelectedSource(airport);
      updateFlightData({ 
        sourceAirport: airport,
        // Update passengers if guest count is set
        ...(itineraryData.guestCount ? { passengers: itineraryData.guestCount } : {})
      });
      syncItineraryData();
    }
  };

  // Handle destination change with context update
  const handleDestinationChange = (value: string, airport?: Airport) => {
    setDestination(value);
    if (airport) {
      setSelectedDestination(airport);
      updateFlightData({ destinationAirport: airport });
      syncItineraryData();
    }
  };

  // Handle departure date change with context update
  const handleDepartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDepartDate(newDate);
    updateFlightData({ departureDate: newDate });
    syncItineraryData();
  };

  // Handle return date change with context update
  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setReturnDate(newDate);
    updateFlightData({ returnDate: newDate });
    syncItineraryData();
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource || !selectedDestination) {
      setError('Please select both source and destination airports');
      return;
    }
    
    if (!departDate) {
      setError('Please select a departure date');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        source: selectedSource.city,
        destination: selectedDestination.city,
        departDate: departDate
      });
      
      if (returnDate) {
        params.append('returnDate', returnDate);
      }

      const response = await fetch(`/api/flights?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch flights');
      }

      if (!data.bestOutboundFlight) {
        throw new Error('No outbound flights found');
      }
      console.log('Flight search results:', data);

      setFlightResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for flights');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking from FlightResults
  const handleBooking = (bookingData: BookingData) => {
    console.log('Booking data received in SearchForm:', bookingData);
    
    // Add flight search parameters to the booking data
    const flightSearchParams = {
      source: selectedSource?.city || '',
      sourceCode: selectedSource?.code,
      destination: selectedDestination?.city || '',
      destinationCode: selectedDestination?.code,
      departDate,
      returnDate,
      isRoundTrip: !!returnDate
    };

    // Update context with flight booking data
    updateFlightData({
      departureDate: departDate,
      returnDate: returnDate,
      sourceAirport: selectedSource,
      destinationAirport: selectedDestination,
      passengers: bookingData.guestCount || 1
    });
    syncItineraryData();

    // Pass the booking data up to the parent component
    onBookingSelect({
      ...bookingData,
      flightSearchParams,
      // Make sure to include the return flight data
      returnFlight: bookingData.returnFlight
    });
  };

  return (
    <div className="space-y-6">
      <form 
        onSubmit={handleSearch}
        className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <FlightSearchInput
              type="source"
              value={source}
              onChange={handleSourceChange}
              placeholder="Enter city or airport"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <FlightSearchInput
              type="destination"
              value={destination}
              onChange={handleDestinationChange}
              placeholder="Enter city or airport"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Departure Date
            </label>
            <input
              type="date"
              value={departDate}
              onChange={handleDepartDateChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              title="Departure Date"
              aria-label="Departure Date"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Return Date
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={handleReturnDateChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={departDate}
              title="Return Date"
              aria-label="Return Date"
            />
          </div>
        </div>

        <div className="px-4 pb-4">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Flights'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {flightResults && (
        <FlightResults
          bestOutboundFlight={flightResults.bestOutboundFlight}
          bestReturnFlight={flightResults.bestReturnFlight}
          isRoundTrip={!!returnDate}
          flightSearchParams={{
            source: selectedSource?.city || '',
            sourceCode: selectedSource?.code,
            destination: selectedDestination?.city || '',
            destinationCode: selectedDestination?.code,
            departDate,
            returnDate,
            isRoundTrip: !!returnDate
          }}
          onBookingSelect={handleBooking}
        />
      )}
    </div>
  );
};

export default SearchForm;