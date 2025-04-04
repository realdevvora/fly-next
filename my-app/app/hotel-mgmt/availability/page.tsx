'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import HotelAvailabilitySearchForm from '../../../components/HotelAvailabilitySearchForm';

/**
 * Hotel availability content component - displays the actual availability UI
 */
const HotelAvailabilityContent: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col dark:bg-gray-900">
      <main className="flex-grow pt-24">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Hotel Availability
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                View your hotel's availabilities based on room type and date.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <HotelAvailabilitySearchForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Main page component that handles authentication protection
 */
const HotelAvailabilityPage: React.FC = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render the content (the useEffect will handle redirect)
  if (!isLoggedIn) {
    return null;
  }

  // Only render the hotel availability content if authenticated
  return <HotelAvailabilityContent />;
};

export default HotelAvailabilityPage;