'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex items-center">
      <div className="flex">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>
    </div>
  );
};

export default StarRating;