import React from 'react';
import SearchForm from './flightComponents/SearchForm';

const Hero: React.FC = () => {
  const handleSearch = (params: any) => {
    console.log('Search params:', params);
    // In a real app, you'd handle the search operation here
  };

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
          alt="Luxury hotel view"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[85vh] flex-col items-center justify-center text-center">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="font-display text-4xl font-semibold leading-tight text-white text-shadow sm:text-5xl md:text-6xl">
              Discover Your Perfect Stay
            </h1>
            <p className="mt-6 text-lg text-white/90 text-shadow-sm sm:text-xl">
              From luxury hotels to cozy apartments, find the ideal accommodation for your next journey.
            </p>
          </div>
          
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {['Exclusive deals', 'No booking fees', 'Price match guarantee', '24/7 customer support'].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span className="text-sm font-medium text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-pulse-soft">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M7 13l5 5 5-5"></path>
          <path d="M7 6l5 5 5-5"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
