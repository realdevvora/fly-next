'use client';
import React, { useState } from 'react';
import SearchForm from './SearchForm';
import ErrorMessage from '@/components/ErrorMessage';
import HotelList from './HotelList';
import HotelDetails from './HotelDetails';
import { BookingData, Hotel } from '@/types';

interface SearchParams {
  city: string;
  startDate: string;
  endDate: string;
  guests: string;
  name?: string;
  starRating?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface HotelListProps {
  hotels: Hotel[] | null;
  onSelectHotel: (hotel: Hotel) => void;
}

interface HotelSearchProps {
  className?: string;
  onBookRoom?: (bookingData: BookingData) => void;
}

const HotelSearch: React.FC<HotelSearchProps> = ({ className = '', onBookRoom }) => {
  const [hotels, setHotels] = useState<Hotel[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelDetailsLoading, setHotelDetailsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  const handleSearch = async (searchParams: SearchParams) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        city: searchParams.city,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        guests: searchParams.guests,
      });
      
      // Add optional parameters only if they have values
      if (searchParams.name) params.append('name', searchParams.name);
      if (searchParams.starRating) params.append('starRating', searchParams.starRating);
      if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
      
      const response = await fetch(`/api/hotel?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotels');
      }
      
      setHotels(data.hotels); // API returns { hotels: [...] }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for hotels');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectHotel = (hotel: Hotel) => {
    if (selectedHotel && selectedHotel.id === hotel.id) {
      // If clicking the same hotel, close the details
      setSelectedHotel(null);
      return;
    }
    // Directly set the selected hotel without making an API call
    setSelectedHotel(hotel);
  };
  
  const handleCloseHotelDetails = () => {
    setSelectedHotel(null);
  };
  
  // New function to handle booking data from HotelDetails
  const handleBookingData = (data: BookingData) => {
    setBookingData(data);
    console.log('Booking data received in HotelSearch:', data);
    
    // If parent component has provided a handler, pass the data up
    if (onBookRoom) {
      onBookRoom(data);
    } else {
      // Otherwise handle the booking here
      handleBookRoom(data);
    }
  };
  
  // Handle booking if not passed up to parent
  const handleBookRoom = async (data: BookingData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bookings/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to book room');
      }
      
      // Handle success (e.g., show confirmation, redirect, etc.)
      console.log('Booking successful:', responseData);
      alert(`Room booked successfully! Booking ID: ${responseData.bookingId}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during booking');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <SearchForm
        onSearch={handleSearch}
        isLoading={isLoading}
        className={className}
      />
      
      <ErrorMessage message={error} />
      
      {hotels && !selectedHotel && (
        <HotelList
          hotels={hotels}
          onSelectHotel={handleSelectHotel}
        />
      )}
      
      {selectedHotel && (
        <HotelDetails
          hotel={selectedHotel}
          onClose={handleCloseHotelDetails}
          isLoading={hotelDetailsLoading}
          onBookRoom={handleBookingData}
        />
      )}
    </div>
  );
};

export default HotelSearch;