'use client';

import React from 'react';

interface BasicSearchFieldsProps {
  city: string;
  setCity: (city: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  guests: string;
  setGuests: (guests: string) => void;
}

const BasicSearchFields: React.FC<BasicSearchFieldsProps> = ({
  city, setCity,
  startDate, setStartDate,
  endDate, setEndDate,
  guests, setGuests
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          City
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Check-in Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          min={new Date().toISOString().split('T')[0]}
          title="Check-in Date"
          aria-label="Check-in Date"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Check-out Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          min={startDate || new Date().toISOString().split('T')[0]}
          title="Check-out Date"
          aria-label="Check-out Date"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Guests
        </label>
        <select
          title="Number of Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BasicSearchFields;