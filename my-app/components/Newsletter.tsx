import React, { useState } from 'react';
import Button from '@/components/Button';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, you'd handle the subscription here
      console.log('Subscribing email:', email);
      setIsSubmitted(true);
      setEmail('');
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }
  };
  
  return (
    <section className="relative overflow-hidden bg-gray-900 py-20 text-white">
      <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            Get Exclusive Travel Deals
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Subscribe to our newsletter and be the first to receive personalized offers, travel inspiration, and exclusive promotions.
          </p>
          
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 sm:w-auto"
              />
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                className="w-full bg-white text-gray-900 hover:bg-white/90 sm:w-auto"
              >
                Subscribe
              </Button>
            </div>
            
            {isSubmitted && (
              <p className="mt-3 animate-fade-in text-green-400">
                Thanks for subscribing! We'll be in touch soon.
              </p>
            )}
            
            <p className="mt-3 text-sm text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {['Trusted by thousands', 'Weekly updates', 'No spam promise'].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
