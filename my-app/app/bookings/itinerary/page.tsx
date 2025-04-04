'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import BookingItinerary from '@/components/bookingComponents/BookingItinerary';

/**
 * Itinerary content component - displays the booking itinerary
 */
const ItineraryContent = () => {
  return (
    <main className="flex-grow pt-24">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <BookingItinerary />
        </div>
      </div>
    </main>
  );
};

/**
 * Main itinerary page that applies authentication protection
 */
export default function Itinerary() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Authentication check and redirect
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render the content (the useEffect will handle redirect)
  if (!isLoggedIn) {
    return null;
  }

  // Only render the itinerary if authenticated
  return <ItineraryContent />;
}