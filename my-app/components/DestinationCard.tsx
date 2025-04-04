import React from 'react';
import Link from 'next/link';

interface DestinationCardProps {
  image: string;
  name: string;
  propertyCount: number;
  slug: string;
  className?: string;
}


// made by lovable :3
const DestinationCard: React.FC<DestinationCardProps> = ({
  image,
  name,
  propertyCount,
  slug,
  className = ''
}) => {
  return (
    <Link 
      href={`/destinations/${slug}`}
      className={`group relative block h-80 overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <img 
        src={image} 
        alt={`${name} destination`} 
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5" />
      
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="font-display text-2xl font-medium text-shadow">{name}</h3>
        <p className="mt-1 text-sm font-medium ">
          {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
        </p>
      </div>
      
      <div className="absolute right-4 top-4 glass-dark rounded-full p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </div>
    </Link>
  );
};

export default DestinationCard;
