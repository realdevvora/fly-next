import React from 'react';

interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  ratingCount?: number;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  image,
  title,
  location,
  price,
  rating,
  ratingCount = 0,
  className = ''
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      
      <div className="absolute bottom-0 w-full p-4">
        <div className="glass rounded-xl p-4 transition-all duration-300 group-hover:bg-white/90">
          <h3 className="font-display text-lg font-medium leading-tight text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{location}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">${price}<span className="text-xs text-gray-500">/night</span></p>
            </div>
            
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-sm font-medium">{rating}</span>
              {ratingCount > 0 && (
                <span className="text-xs text-gray-500">({ratingCount})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
