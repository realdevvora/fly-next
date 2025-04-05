'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const Dashboard: React.FC = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Authentication check and redirect
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-6 rounded-lg">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect handling
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header spacing to prevent content from being too close to top */}
      <div className="h-16"></div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Itinerary Card */}
          <Link href="/bookings/itinerary" className="block h-full">
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Itinerary</h2>
                <p className="text-gray-600 dark:text-gray-300">View your travel schedule and plans</p>
              </div>
            </div>
          </Link>
          
          {/* View Bookings Card */}
          <Link href="/bookings/view" className="block h-full">
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">View Bookings</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage your reservations and tickets</p>
              </div>
            </div>
          </Link>
          
          {/* Add a third card for symmetry */}
          <Link href="/checkout" className="block h-full">
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Checkout</h2>
                <p className="text-gray-600 dark:text-gray-300">Checkout your bookings</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
      
      <footer className="bg-gray-800 dark:bg-gray-950 text-white text-center py-6 mt-auto">
        <p className="text-lg">© 2025 FlyNext</p>
      </footer>
    </div>
  );
};

export default Dashboard;