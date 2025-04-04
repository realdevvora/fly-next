'use client';

import React from 'react';
import Button from '@/components/Button';
import StarRating from './components/StarRating';
import AmenityTags from './components/AmenityTags';
import { formatPrice } from '../../utils/formatters';
import { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  // Find the cheapest room type for this hotel
  const cheapestRoom = hotel.roomTypes.reduce(
    (min, room) => (room.pricePerNight < min.pricePerNight ? room : min),
    hotel.roomTypes[0]
  );
  
  return (
    <div 
      className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => onSelect(hotel)}
    >
      {(hotel.images?.[0] || cheapestRoom.images?.[0]) && (
        <div className="relative h-48">
          <img
            src={`${hotel.images?.[0] || cheapestRoom.images?.[0]}`} 
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg shadow-md">
            <StarRating rating={hotel.starRating} />
          </div>
        </div>
      )}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold">{hotel.name}</h3>
        <p className="text-sm mt-1 text-gray-600">{hotel.address}, {hotel.city}</p>
        
        <div className="mt-2 flex-grow">
          <div className="text-sm">
            <span className="font-medium">Available room types: </span>
            {hotel.roomTypes.length}
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Top Amenities</h4>
            <AmenityTags amenities={hotel.roomTypes.flatMap(room => room.amenities)} />
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t flex justify-between items-end">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(cheapestRoom.pricePerNight)}
            </div>
            <div className="text-xs text-gray-600">per night</div>
          </div>
          <Button variant="secondary" size="sm">View Details</Button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;