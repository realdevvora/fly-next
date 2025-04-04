'use client';
import React from 'react';
import HotelCard from './HotelCard';
import { Hotel } from '@/types';

interface HotelListProps {
  hotels: Hotel[] | null;
  onSelectHotel: (hotel: Hotel) => void;
}

const HotelList: React.FC<HotelListProps> = ({ hotels, onSelectHotel }) => {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold">No hotels found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onSelect={onSelectHotel} />
        ))}
      </div>
    </div>
  );
};

export default HotelList;