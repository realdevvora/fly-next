'use client';
import React, { useState, useEffect } from 'react';
import { useItinerary } from '@/components/contexts/ItineraryContext';
import { HotelSearchParams } from '@/types';

interface SearchFormProps {
  onSearch: (params: HotelSearchParams) => void;
  isLoading: boolean;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, className = '' }) => {
  const { itineraryData, updateHotelData, syncItineraryData } = useItinerary();
  
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
    city: '',
    startDate: '',
    endDate: '',
    guests: '1',
    name: '',
    starRating: '',
    minPrice: '',
    maxPrice: ''
  });
  
  // Update form when itinerary data changes from flight component
  useEffect(() => {
    if (itineraryData.lastUpdatedBy === 'flight') {
      const newParams = { ...searchParams };
      
      if (itineraryData.destinationAirport?.city) {
        newParams.city = itineraryData.destinationAirport.city;
      }
      
      if (itineraryData.departureDate) {
        newParams.startDate = itineraryData.departureDate;
      }
      
      if (itineraryData.returnDate) {
        newParams.endDate = itineraryData.returnDate;
      }
      
      if (itineraryData.passengers) {
        newParams.guests = itineraryData.passengers.toString();
      }
      
      setSearchParams(newParams);
    }
  }, [itineraryData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setSearchParams((prev: HotelSearchParams) => ({
      ...prev,
      [name]: value
    }));
    
    // Update context with hotel data
    if (name === 'city') {
      updateHotelData({ destinationCity: value });
    } else if (name === 'startDate') {
      updateHotelData({ checkInDate: value });
    } else if (name === 'endDate') {
      updateHotelData({ checkOutDate: value });
    } else if (name === 'guests') {
      updateHotelData({ guestCount: parseInt(value) });
    }
    
    // Sync data with flight component
    syncItineraryData();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  
  // Formats today's date as YYYY-MM-DD for min date in datepickers
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            Destination City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={searchParams.city}
            onChange={handleChange}
            placeholder="Enter city"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* Check-in Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={searchParams.startDate}
            min={today}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* Check-out Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={searchParams.endDate}
            min={searchParams.startDate || today}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* Guests */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium mb-1">
            Guests
          </label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={searchParams.guests}
            min="1"
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      {/* Advanced filters - collapsible section */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-medium mb-2">
          Advanced Search Options
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          {/* Hotel Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Hotel Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={searchParams.name}
              onChange={handleChange}
              placeholder="Hotel name"
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Star Rating */}
          <div>
            <label htmlFor="starRating" className="block text-sm font-medium mb-1">
              Star Rating
            </label>
            <select
              id="starRating"
              name="starRating"
              value={searchParams.starRating}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
          
          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={searchParams.minPrice}
              onChange={handleChange}
              placeholder="Min price"
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Max Price */}
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={searchParams.maxPrice}
              onChange={handleChange}
              placeholder="Max price"
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </details>
      
      {/* Search Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Searching...' : 'Search Hotels'}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;