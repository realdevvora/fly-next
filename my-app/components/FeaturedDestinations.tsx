import React from 'react';
import DestinationCard from '@/components/DestinationCard';

const destinations = [
  {
    id: 1,
    name: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    propertyCount: 532,
    slug: 'new-york'
  },
  {
    id: 2,
    name: 'Paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    propertyCount: 427,
    slug: 'paris'
  },
  {
    id: 3,
    name: 'Tokyo',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    propertyCount: 386,
    slug: 'tokyo'
  },
  {
    id: 4,
    name: 'Barcelona',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
    propertyCount: 251,
    slug: 'barcelona'
  },
  {
    id: 5,
    name: 'Santorini',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80',
    propertyCount: 124,
    slug: 'santorini'
  },
  {
    id: 6,
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1554481923-a6918bd997bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1965&q=80',
    propertyCount: 367,
    slug: 'bali'
  }
];

const FeaturedDestinations: React.FC = () => {
  return (
    <section className="section-padding overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-medium leading-tight md:text-4xl">
            Popular Destinations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg">
            Explore our handpicked selection of the world's most sought-after destinations
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <div 
              key={destination.id} 
              className="animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <DestinationCard
                image={destination.image}
                name={destination.name}
                propertyCount={destination.propertyCount}
                slug={destination.slug}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
