'use client';

import React, { useState, useEffect } from 'react';
import BookingSearchInput from './HotelBookingSearchInput';
import HotelAvailabilityResults from './HotelAvailabilityResults';
import Button from './Button';

interface Hotel {
  id: string;
  name: string;
  location?: string;
}

interface HotelAvailability {
  roomType: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

interface HotelAvailabilitySearchProps {
  className?: string;
}

const HotelAvailabilitySearchForm: React.FC<HotelAvailabilitySearchProps> = ({ className = '' }) => {
  // State for form fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availabilityResults, setAvailabilityResults] = useState<HotelAvailability[] | null>(null);
  
  // State for dropdown data
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoadingHotels(true);
      try {
        const response = await fetch('/api/hotel/owned', {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch your hotels');
        }
        
        setHotels(data.hotels || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your hotels');
      } finally {
        setIsLoadingHotels(false);
      }
    };
    
    fetchHotels();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!selectedHotelId) {
      setError('Please select a hotel');
      return;
    }
    
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    
    if (!endDate) {
      setError('End date is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });

      const response = await fetch(`/api/hotel/${selectedHotelId}/availability?${params.toString()}`, {
        method: 'GET',
        credentials: 'include', 
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch availability');
      }

      setAvailabilityResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className={`rounded-2xl overflow-hidden ${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Hotel Selection Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Hotel <span className="text-red-500">*</span>
            </label>
            <select
              aria-label="Select hotel"
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingHotels}
              required
            >
              <option value="">Select a hotel</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
            {isLoadingHotels && (
              <div className="text-sm text-gray-500">Loading your hotels...</div>
            )}
          </div>

          <BookingSearchInput
            type="date"
            value={startDate}
            onChange={setStartDate}
            placeholder="Select start date"
            label="Start Date"
            required={true}
          />
          
          <BookingSearchInput
            type="date"
            value={endDate}
            onChange={setEndDate}
            placeholder="Select end date"
            label="End Date"
            required={true}
          />
        </div>

        <div className="px-4 pb-4">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isLoading || isLoadingHotels}
          >
            {isLoading ? 'Checking Availability...' : 'Check Room Availability'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {availabilityResults && (
        <HotelAvailabilityResults 
          results={availabilityResults} 
          hotelId={selectedHotelId} 
          startDate={startDate} 
          endDate={endDate} 
        />
      )}
    </div>
  );
};

export default HotelAvailabilitySearchForm;