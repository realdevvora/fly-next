'use client';

import React from 'react';

interface AdvancedFiltersProps {
  name: string;
  setName: (name: string) => void;
  starRating: string;
  setStarRating: (rating: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  show: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  name, setName,
  starRating, setStarRating,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  show
}) => {
  if (!show) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 pt-0">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Hotel Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter hotel name"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Star Rating
        </label>
        <select
          title="Star Rating"
          value={starRating}
          onChange={(e) => setStarRating(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Min Price
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price per night"
            min="0"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Max Price
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price per night"
            min={minPrice || "0"}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
