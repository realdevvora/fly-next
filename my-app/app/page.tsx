'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Hero from '@/components/Hero';
import TestimonialSection from '@/components/TestimonialSection';
import Newsletter from '@/components/Newsletter';
import Button from '@/components/Button';

const Index: React.FC = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // For hydration mismatch prevention
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      <main className="flex-grow">
        <Hero />
        
        {/* Featured Properties */}
        <section className={`section-padding ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className={`font-display text-3xl font-medium leading-tight md:text-4xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Featured Properties
                </h2>
                <p className={`mt-2 max-w-2xl ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Explore our handpicked selection of exceptional accommodations
                </p>
              </div>
              <Button 
                as="link" 
                to="/hotels" 
                variant={isDark ? "outline" : "outline"}
              >
                View all properties
              </Button>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className={`section-padding ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className={`font-display text-3xl font-medium md:text-4xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Why Choose FlyNext
              </h2>
              <p className={`mx-auto mt-4 max-w-2xl text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We're committed to making your travel experience exceptional from start to finish
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                      <path d="M19.692 10h.01"></path>
                      <path d="M22 10c0 5.523-4.477 10-10 10-5.522 0-10-4.477-10-10 0-5.522 4.478-10 10-10 5.523 0 10 4.478 10 10Z"></path>
                      <path d="m17.42 15 .555 2.561a1.035 1.035 0 0 1-1.108 1.262 9.001 9.001 0 0 1-9.723-9.724 1.035 1.035 0 0 1 1.262-1.108L11 8.578"></path>
                    </svg>
                  ),
                  title: '24/7 Customer Support',
                  description: 'Our dedicated team is available around the clock to assist with any questions or concerns you may have.'
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 11 3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  ),
                  title: 'Best Price Guarantee',
                  description: "Find a lower price elsewhere? We'll match it and give you an additional 10% discount."
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  ),
                  title: 'Flexible Cancellation',
                  description: "Plans change. That's why we offer flexible cancellation options on most bookings."
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  ),
                  title: 'Verified Reviews',
                  description: 'All reviews are from real guests who have stayed at the properties, ensuring authentic feedback.'
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center rounded-xl p-6 text-center transition-all ${
                    isDark 
                      ? 'hover:bg-gray-700 hover:shadow-lg' 
                      : 'hover:bg-gray-50 hover:shadow-lg'
                  }`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    isDark 
                      ? 'bg-primary/20 text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className={`mt-4 text-xl font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`mt-2 text-base ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <TestimonialSection />
        <Newsletter />
      </main>
    </div>
  );
};

export default Index;