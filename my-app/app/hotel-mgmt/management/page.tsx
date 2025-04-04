"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import HotelForm from '../../../components/HotelForm';
import RoomTypeForm from '../../../components/RoomTypeForm';
import CancelReservation from '../../../components/CancelReservation';
import UpdateRoomAvailability from '../../../components/UpdateRoomAvailability';

// Hotel Management Dashboard Content Component
const HotelManagementDashboard = () => {
  return (
    <div className="mt-10 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Hotel Management
        </h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Manage your hotels, rooms, and reservations
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hotel Section */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <HotelForm />
          </div>
          {/* Room Type Section */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <RoomTypeForm />
          </div>
          {/* Cancel Reservation */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <CancelReservation />
          </div>
          {/* Update Availability */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <UpdateRoomAvailability />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the page content with proper authentication protection
const HotelManagementPage = () => {
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

  // Only render the hotel management dashboard if authenticated
  return <HotelManagementDashboard />;
};

export default HotelManagementPage;