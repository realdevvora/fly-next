'use client';

import React, { useState, useEffect } from 'react';
import BookingSearchInput from './HotelBookingSearchInput';
import BookingResults from './HotelBookingResults';
import Button from './Button';

interface Hotel {
  id: string;
  name: string;
  location?: string;
}

interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
}

interface HotelSearchProps {
  className?: string;
}

const HotelSearchForm: React.FC<HotelSearchProps> = ({ className = '' }) => {
  // State for form fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hotelResults, setHotelResults] = useState<any>(null);
  
  // State for dropdown data
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedRoomTypeName, setSelectedRoomTypeName] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
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

  // Fetch room types when a hotel is selected
  useEffect(() => {
    if (!selectedHotelId) {
      setRoomTypes([]);
      setSelectedRoomTypeName(''); // Reset room type selection when hotel changes
      return;
    }
    
    const fetchRoomTypes = async () => {
      setIsLoadingRoomTypes(true);
      setSelectedRoomTypeName(''); // Reset the selected room type when fetching new room types
      
      try {
        const response = await fetch(`/api/hotel/${selectedHotelId}/roomTypes`, {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch room types');
        }
        console.log("room types", data.roomTypes);
        setRoomTypes(data.roomTypes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room types');
      } finally {
        setIsLoadingRoomTypes(false);
      }
    };
    
    fetchRoomTypes();
  }, [selectedHotelId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelId) {
      setError('Please select a hotel');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        hotelId: selectedHotelId,
      });

      if (selectedRoomTypeName) params.append('roomTypeName', selectedRoomTypeName);
      if (startDate.trim()) params.append('startDate', new Date(startDate).toISOString());
      if (endDate.trim()) params.append('endDate', new Date(endDate).toISOString());

      const response = await fetch(`/api/hotel/booking?${params.toString()}`, {
        method: 'GET',
        credentials: 'include', 
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setHotelResults(data.filteredBookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {/* Hotel Selection Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hotel
            </label>
            <select
              name="hotel"
              aria-label='Select a hotel'
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading your hotels...</div>
            )}
          </div>

          {/* Room Type Selection Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Type
            </label>
            <select
              name="roomType"
              aria-label='Select a room type'
              value={selectedRoomTypeName}
              onChange={(e) => setSelectedRoomTypeName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoadingRoomTypes || !selectedHotelId}
            >
              <option value="">Select a room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.name}>
                  {roomType.name}
                </option>
              ))}
            </select>
            {isLoadingRoomTypes && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading room types...</div>
            )}
          </div>

          <BookingSearchInput
            type="date"
            value={startDate}
            onChange={setStartDate}
            placeholder="Select start date"
            label="Start Date"
          />
          
          <BookingSearchInput
            type="date"
            value={endDate}
            onChange={setEndDate}
            placeholder="Select end date"
            label="End Date"
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
            {isLoading ? 'Searching...' : 'Search Bookings'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {hotelResults && (
        <BookingResults results={hotelResults} />
      )}
    </div>
  );
};

export default HotelSearchForm;