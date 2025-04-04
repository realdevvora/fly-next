'use client';

import React from 'react';

interface AmenityTagsProps {
  amenities: string[];
  limit?: number;
}

const AmenityTags: React.FC<AmenityTagsProps> = ({ amenities, limit = 3 }) => {
  const uniqueAmenities = Array.from(new Set(amenities));
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {uniqueAmenities.slice(0, limit).map((amenity, index) => (
        <span 
          key={index}
          className="px-2 py-1 text-xs bg-blue-50 rounded-full"
        >
          {amenity}
        </span>
      ))}
    </div>
  );
};

export default AmenityTags;
