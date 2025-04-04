import React, { useState } from 'react';
import Button from '../Button';

interface HotelSearchFormProps {
  onSearch: (searchParams: Record<string, string>) => void;
  isLoading: boolean;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch, isLoading }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, checkIn, checkOut });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        aria-label='Check-in date'
        type="date"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        aria-label='Check-out date'
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
};

export default HotelSearchForm;