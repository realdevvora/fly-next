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
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render the content (the useEffect will handle redirect)
  if (!isLoggedIn) {
    return null;
  }

  // Only render the dashboard if authenticated
  return (
    <div className="min-h-screen flex flex-col mt-16 bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link href="/bookings/itinerary" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Itinerary</h2>
              <p className="text-gray-600 dark:text-gray-300">View your travel schedule and plans</p>
            </div>
          </Link>
          <Link href="/bookings/view" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">View Bookings</h2>
              <p className="text-gray-600 dark:text-gray-300">Manage your reservations and tickets</p>
            </div>
          </Link>
        </div>
      </main>
      <footer className="bg-gray-800 dark:bg-gray-950 text-white text-center p-4 mt-auto">
        <p>© 2025 FlyNext</p>
      </footer>
    </div>
  );
};

export default Dashboard;