'use client';
import React, { useState } from 'react';
import HotelSearch from './HotelSearch';
import { BookingData } from '@/types';

interface HotelSearchPageProps {
  onBookRoom?: (data: BookingData) => void;
}

function HotelSearchPageInner({ onBookRoom }: HotelSearchPageProps) {
  const [localBookingStatus, setLocalBookingStatus] = useState({
    isLoading: false,
    error: null as string | null,
    success: false
  });

  // Handle booking data from HotelSearch
  const handleBookRoom = (bookingData: BookingData) => {
    // Log the data being captured
    console.log('Hotel booking data received:', bookingData);
    
    // Set local loading state for UI feedback
    setLocalBookingStatus({
      isLoading: true,
      error: null,
      success: false
    });

    try {
      // Pass the booking data up to the parent component if onBookRoom is provided
      if (onBookRoom) {
        onBookRoom(bookingData);
      }
      
      // Update local state to show success
      setLocalBookingStatus({
        isLoading: false,
        error: null,
        success: true
      });
    } catch (err) {
      // Handle any local errors
      setLocalBookingStatus({
        isLoading: false,
        error: err instanceof Error ? err.message : 'An error occurred processing your selection',
        success: false
      });
    }
  };

  return (
    <div className="w-full">
      {/* Display local booking status messages */}
      {localBookingStatus.isLoading && (
        <div className="mb-3 bg-blue-50 rounded p-2 text-sm">
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-blue-700">Processing...</p>
          </div>
        </div>
      )}
      
      {localBookingStatus.success && (
        <div className="mb-3 bg-green-50 rounded p-2 text-sm">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700">Hotel selected!</p>
          </div>
        </div>
      )}
      
      {localBookingStatus.error && (
        <div className="mb-3 bg-red-50 rounded p-2 text-sm">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{localBookingStatus.error}</p>
          </div>
        </div>
      )}
      
      <HotelSearch onBookRoom={handleBookRoom} />
    </div>
  );
}

export default function HotelSearchPage({ onBookRoom }: HotelSearchPageProps) {
  const handleBookRoom = (bookingData: BookingData) => {
    // Process the booking data
    console.log('Booking data to be processed:', bookingData);
    
    // If an external handler was provided, call it
    if (onBookRoom) {
      onBookRoom(bookingData);
    }
  };

  return (
    <HotelSearchPageInner onBookRoom={handleBookRoom} />
  );
}