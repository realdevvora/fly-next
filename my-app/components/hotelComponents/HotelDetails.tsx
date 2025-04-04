'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Hotel, BookingData } from '@/types'; // Adjust the import based on your project structure
import dynamic from 'next/dynamic';

// Dynamically import the map components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface HotelDetailsProps {
  hotel: Hotel;
  onClose: () => void;
  isLoading: boolean;
  onBookRoom: (bookingData: BookingData) => void;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ 
  hotel, 
  onClose,
  isLoading,
  onBookRoom
}) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [bookingStatus, setBookingStatus] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
    roomTypeId: string | null;
    bookingId: string | null;
  }>({
    isLoading: false,
    error: null,
    success: false,
    roomTypeId: null,
    bookingId: null
  });

  // Function to handle room booking
  const handleBookRoom = async (roomTypeId: string) => {
    // Check if user is logged in before proceeding
    if (!isLoggedIn) {
      // Instead of immediate navigation, show a dialog or use a more graceful approach
      const willLogin = window.confirm("You need to be logged in to book a room. Would you like to log in now?");
      
      if (willLogin) {
        // Store the intended action in sessionStorage for after login
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          hotelId: hotel.id,
          roomTypeId: roomTypeId
        }));
        
        // Then navigate
        router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    setBookingStatus({
      isLoading: true,
      error: null,
      success: false,
      roomTypeId,
      bookingId: null
    });

    try {
      // Get today and tomorrow's date for default booking
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkInDate = today.toISOString().split('T')[0];
      const checkOutDate = tomorrow.toISOString().split('T')[0];

      console.log('Booking room with ID:', roomTypeId);
      console.log('Check-in date:', checkInDate);
      console.log('Check-out date:', checkOutDate);

      // Create booking data object
      const bookingData: BookingData = {
        flightIds: [], // No flights in this case
        roomTypeId: roomTypeId,
        checkInDate,
        checkOutDate,
        numberOfRooms: 1,
        guestCount: 1,
        passportNumber: 'DUMMY12345', // Using dummy value
        hotelId: hotel.id
      };

      // Pass the booking data up to the parent component
      onBookRoom(bookingData);

      // Update local state to show success
      setBookingStatus({
        isLoading: false,
        error: null,
        success: true,
        roomTypeId,
        bookingId: 'pending' // The actual ID will be handled by the parent
      });

    } catch (error) {
      setBookingStatus({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false,
        roomTypeId,
        bookingId: null
      });
    }
  };

  // Parse coordinates from hotel.location
  const coordinates = hotel.location ? hotel.location.split(',').map(coordinate => parseFloat(coordinate.trim())) : [0, 0];
  const [latitude, longitude] = coordinates;
  const hasValidCoordinates = !isNaN(latitude) && !isNaN(longitude);

  if (isLoading) {
    return <div className="p-4 text-center">Loading hotel details...</div>;
  }

  // Find the cheapest room type for the "starting from" price
  const cheapestRoom = hotel.roomTypes && hotel.roomTypes.length > 0
    ? hotel.roomTypes.reduce((min, room) => room.pricePerNight < min.pricePerNight ? room : min, hotel.roomTypes[0])
    : null;

  // Get a unique list of all amenities across all room types
  const allAmenities = hotel.roomTypes && hotel.roomTypes.length > 0
    ? [...new Set(hotel.roomTypes.flatMap(room => room.amenities))]
    : [];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800 dark:text-white">
      <div className="relative h-48 sm:h-64">
        {hotel.images && hotel.images.length > 0 ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No image available</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
          aria-label="Close details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold dark:text-white">{hotel.name}</h2>
            <div className="flex items-center mt-1">
              {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{hotel.address}</p>
            <p className="text-gray-600 dark:text-gray-300">{hotel.city}, {hotel.country}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${cheapestRoom ? cheapestRoom.pricePerNight.toFixed(2) : "N/A"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">starting from - per night</p>
          </div>
        </div>

        {/* Room Types */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2 dark:text-white">Available Room Types</h3>
          <div className="space-y-4">
            {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
              hotel.roomTypes.map((roomType) => (
                <div key={roomType.id} className="border rounded-lg p-3 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium dark:text-white">{roomType.name}</h4>
                    <p className="font-bold text-blue-600 dark:text-blue-400">${roomType.pricePerNight.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Available rooms: {roomType.totalRooms}</p>
                  
                  {/* Room Images Carousel */}
                  {roomType.images && roomType.images.length > 0 && (
                    <div className="relative h-40 mt-3 overflow-hidden rounded">
                      <Image
                        src={roomType.images[0]}
                        alt={roomType.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Room Amenities */}
                  <div className="mt-3">
                    <h5 className="text-sm font-medium dark:text-white">Room Amenities:</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {roomType.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{amenity}</span>
                      ))}
                      {roomType.amenities.length > 3 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">+{roomType.amenities.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Booking Dates */}
                  {roomType.roomBookings && roomType.roomBookings.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      <span>Recent booking: </span>
                      <span>Check-in: {roomType.roomBookings[0].checkInDate}</span>
                      <span className="mx-2">•</span>
                      <span>Check-out: {roomType.roomBookings[0].checkOutDate}</span>
                    </div>
                  )}
                  
                  {/* Book Now Button with Status */}
                  {bookingStatus.isLoading && bookingStatus.roomTypeId === roomType.id ? (
                    <button disabled className="mt-3 bg-gray-400 text-white py-2 px-4 rounded-md w-full flex justify-center items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </button>
                  ) : bookingStatus.success && bookingStatus.roomTypeId === roomType.id ? (
                    <div className="mt-3 bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-2 rounded-md text-center">
                      Booked successfully! {bookingStatus.bookingId !== 'pending' && `Booking ID: ${bookingStatus.bookingId}`}
                    </div>
                  ) : bookingStatus.error && bookingStatus.roomTypeId === roomType.id ? (
                    <div>
                      <div className="mt-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-md text-center text-sm">
                        {bookingStatus.error}
                      </div>
                      <button 
                        onClick={() => handleBookRoom(roomType.id)}
                        className="mt-2 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors w-full"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : !isLoggedIn ? (
                    <button 
                      onClick={() => handleBookRoom(roomType.id)} 
                      className="mt-3 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors w-full flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login to Book
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBookRoom(roomType.id)}
                      className="mt-3 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors w-full"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No room types available for this hotel.</p>
            )}
          </div>
        </div>

        {/* Hotel Amenities Section */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2 dark:text-white">All Available Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {allAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Location Information with Map */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2 dark:text-white">Location</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
            Coordinates: {hotel.location}
          </p>
          
          {/* Map Component */}
          {hasValidCoordinates && (
            <>
              {/* Import Leaflet CSS in head */}
              <style jsx global>{`
                @import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
              `}</style>
              
              <div className="h-64 rounded-lg overflow-hidden mt-2 border dark:border-gray-700">
                <MapContainer 
                  center={[latitude, longitude]} 
                  zoom={14} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      <div className="text-gray-800">
                        <strong>{hotel.name}</strong><br />
                        {hotel.address}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;