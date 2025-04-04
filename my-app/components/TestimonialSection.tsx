'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const testimonials = [
  {
    id: 1,
    content: "FlyNext made our honeymoon planning absolutely seamless. The hotel they recommended was perfect, and their attention to detail ensured everything went smoothly. Could not have asked for a better experience!",
    author: "Sarah & James",
    location: "Newlyweds from London",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    content: "As a business traveler, I need reliability and efficiency. FlyNext consistently delivers both. Their mobile app makes booking and managing reservations incredibly simple, even when my schedule changes.",
    author: "Michael Chen",
    location: "Technology Consultant",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    content: "I've used many booking platforms, but FlyNext has the best selection of unique properties. We found an amazing villa in Bali that was not listed anywhere else. Their customer service went above and beyond.",
    author: "Elena Rodriguez",
    location: "Adventure Seeker",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  }
];

const TestimonialSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Determine if dark mode is active
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
  
  return (
    <section className={`relative overflow-hidden py-24 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="absolute left-0 top-0 -z-10 h-full w-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <path 
            d="M0 0L100 0C100 0 100 20 50 20C0 20 0 40 0 40L0 0Z" 
            fill={isDark ? "#374151" : "white"} 
            opacity="0.2"
          />
          <path 
            d="M0 40L0 60C0 60 0 40 50 40C100 40 100 20 100 20L100 40L0 40Z" 
            fill={isDark ? "#374151" : "white"} 
            opacity="0.1"
          />
          <path 
            d="M0 60L0 80C0 80 0 60 50 60C100 60 100 80 100 80L100 60L0 60Z" 
            fill={isDark ? "#374151" : "white"} 
            opacity="0.05"
          />
        </svg>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={`font-display text-3xl font-medium md:text-4xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            What Our Travelers Say
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Real experiences from real travelers around the world
          </p>
        </div>
        
        <div className="relative mt-16 h-[340px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`absolute left-0 top-0 w-full transition-all duration-700 ${
                index === activeIndex 
                  ? 'opacity-100 translate-y-0 z-10' 
                  : 'opacity-0 translate-y-8 -z-10'
              }`}
            >
              <div className={`mx-auto max-w-3xl rounded-2xl p-8 shadow-lg ${
                isDark 
                  ? 'bg-gray-800 shadow-gray-900/50' 
                  : 'bg-white shadow-gray-200/50'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className={`mb-6 ${isDark ? 'text-gray-700' : 'text-gray-200'}`}
                  >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  
                  <blockquote className={`text-lg md:text-xl ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="mt-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      className="mx-auto h-14 w-14 rounded-full object-cover"
                    />
                    <p className={`mt-3 font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.author}
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex 
                  ? isDark 
                    ? 'bg-white w-6' 
                    : 'bg-gray-900 w-6' 
                  : isDark 
                    ? 'bg-gray-700 w-2.5' 
                    : 'bg-gray-300 w-2.5'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;