'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// The content of the hotel management dashboard
const HotelManagementDashboardContent = () => {
  return (
    <div className="mt-20 min-h-screen p-8 transition-colors duration-200 bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Dashboard Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg mb-4">Welcome to the hotel management portal. Please choose an option below:</p>
          <div className="w-16 h-1 bg-blue-500 rounded"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/hotel-mgmt/availability"
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center group hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Check Availability</h2>
            <p>View rooms and check availability calendars</p>
          </Link>

          <Link
            href="/hotel-mgmt/bookings"
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center group hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">View Bookings</h2>
            <p>Access and review all current bookings</p>
          </Link>

          <Link
            href="/hotel-mgmt/management"
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center group hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Manage Hotels</h2>
            <p>Configure hotels, rooms, and settings</p>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Hotel Management System</p>
        </div>
      </div>
    </div>
  );
};

// Main page component with authentication protection
export default function HotelManagementPage() {
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

  // Only render the dashboard content if authenticated
  return <HotelManagementDashboardContent />;
}