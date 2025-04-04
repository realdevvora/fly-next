import React from 'react';

interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  totalRooms: number;
  hotelId: string;
  amenities: string[];
  images: string[];
}

interface RoomBooking {
  id: string;
  bookingId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  hotelId: string;
  roomType: RoomType;
}

interface Booking {
  id: string;
  userId: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  flightSearchParams: string;
  roomBookings: RoomBooking[];
}

interface BookingResultsProps {
  results: Booking[];
}

const BookingResults: React.FC<BookingResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return <p className="text-gray-800 dark:text-gray-200">No available rooms found for your search.</p>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {results.map((booking) => (
        booking.roomBookings.map((roomBooking, roomIndex) => (
          <div 
            key={`${booking.id}-${roomIndex}`} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="space-y-2 w-full md:w-auto">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">Booking ID: {booking.id}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Status: {booking.status}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Room Type: {roomBooking.roomType.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Description: {roomBooking.roomType.description}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Check-in: {new Date(roomBooking.checkInDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Check-out: {new Date(roomBooking.checkOutDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Guests: {roomBooking.guestCount}</div>
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Booked on: {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2 md:mt-0">
                {formatPrice(roomBooking.totalPrice)}
              </div>
            </div>
            {roomBooking.roomType.amenities && roomBooking.roomType.amenities.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Amenities:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roomBooking.roomType.amenities.map((amenity, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ))}
    </div>
  );
};

export default BookingResults;