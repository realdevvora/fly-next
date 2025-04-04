'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Airport } from '@/types';

// Define interfaces for our context data
export interface ItineraryData {
  // Flight info
  sourceAirport?: Airport;
  destinationAirport?: Airport;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  
  // Hotel info
  destinationCity?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  
  // Flag to track which component initiated the change
  lastUpdatedBy: 'flight' | 'hotel' | 'none';
}

interface ItineraryContextType {
  itineraryData: ItineraryData;
  updateFlightData: (data: Partial<ItineraryData>) => void;
  updateHotelData: (data: Partial<ItineraryData>) => void;
  syncItineraryData: () => void;
  // Add a reset function
  resetItinerary: () => void;
}

// Create the context with a default value
const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

// Context provider component
export const ItineraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [itineraryData, setItineraryData] = useState<ItineraryData>({
    lastUpdatedBy: 'none'
  });

  // Update flight data
  const updateFlightData = (data: Partial<ItineraryData>) => {
    setItineraryData(prev => ({
      ...prev,
      ...data,
      lastUpdatedBy: 'flight'
    }));
  };

  // Update hotel data
  const updateHotelData = (data: Partial<ItineraryData>) => {
    setItineraryData(prev => ({
      ...prev,
      ...data,
      lastUpdatedBy: 'hotel'
    }));
  };

  // Reset the itinerary
  const resetItinerary = () => {
    setItineraryData({
      lastUpdatedBy: 'none'
    });
  };

  // Sync data between flight and hotel components
  const syncItineraryData = () => {
    setItineraryData(prev => {
      const newData = { ...prev };
      
      if (prev.lastUpdatedBy === 'flight') {
        // If flight data was updated, sync to hotel data
        if (prev.destinationAirport && prev.destinationAirport.city) {
          newData.destinationCity = prev.destinationAirport.city;
        }
        
        if (prev.departureDate) {
          newData.checkInDate = prev.departureDate;
        }
        
        if (prev.returnDate) {
          newData.checkOutDate = prev.returnDate;
        }
        
        if (prev.passengers) {
          newData.guestCount = prev.passengers;
        }
      }
      else if (prev.lastUpdatedBy === 'hotel') {
        // If hotel data was updated, sync to flight data
        if (prev.checkInDate) {
          newData.departureDate = prev.checkInDate;
        }
        
        if (prev.checkOutDate) {
          newData.returnDate = prev.checkOutDate;
        }
        
        if (prev.guestCount) {
          newData.passengers = prev.guestCount;
        }
        // Note: We don't auto-update destination/source airports based on hotel city
        // as this would require additional lookup functionality
      }
      
      return newData;
    });
  };

  return (
    <ItineraryContext.Provider value={{
      itineraryData,
      updateFlightData,
      updateHotelData,
      syncItineraryData,
      resetItinerary
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};

// Custom hook for using the context
export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};