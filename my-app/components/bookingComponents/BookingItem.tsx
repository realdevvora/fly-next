import React, { memo } from 'react';
import { Card, CardContent } from "@/components/Card";
import Button from "@/components/Button";

export interface BookingRoom {
  id: string;
  roomType: {
    name: string;
    pricePerNight: number;
    hotel: {
      name: string;
      city: string;
      country: string;
      starRating: number;
    }
  }
}

export interface FlightBooking {
  id: string;
  booking_id: string;
  afsBookingId: string;
}

export interface PaymentInfo {
  lastFourDigits: string;
  cardholderName: string;
}

export interface Booking {
  id: string;
  status: string;
  totalPrice: number;
  totalAmount?: number; // Added for compatibility with existing code
  bookingDate: string;
  roomBookings: BookingRoom[];
  flightBookingReferences: FlightBooking[];
  paymentInfo?: PaymentInfo;
}

export interface CheckoutFormData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
}

const BookingItem: React.FC<{
  booking: Booking;
  onCancel: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
}> = ({ booking, onCancel, isSelected, onSelect }) => {
  // Format date for better display
  const formattedDate = new Date(booking.bookingDate).toLocaleDateString();
  
  // Handle cancellation with confirmation
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onCancel(booking.id);
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    onSelect(booking.id, e.target.checked);
  };

  return (
    <Card className="mb-4 bg-white shadow-md rounded-xl overflow-hidden">
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Booking #{booking.id}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              booking.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
              booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}>
              {booking.status}
            </span>
            {booking.status === "PENDING" && (
              <>
                <input
                  aria-label="Select booking"
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Button
                  onClick={handleCancel}
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          <p>Date: {formattedDate}</p>
          <p>Total Amount: ${booking.totalPrice.toFixed(2)}</p>
        </div>
        {booking.roomBookings?.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Hotels:</h4>
            <div className="pl-2 border-l-2 border-blue-200">
              {booking.roomBookings.map((room) => (
                <div key={room.id} className="text-xs text-gray-700 mb-1">
                  <p>{room.roomType.hotel.name} - {room.roomType.hotel.city}, {room.roomType.hotel.country}</p>
                  <p>Room: {room.roomType.name} - ${room.roomType.pricePerNight.toFixed(2)}/night</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {booking.flightBookingReferences?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Flights:</h4>
            <div className="pl-2 border-l-2 border-blue-200">
              {booking.flightBookingReferences.map((flight) => (
                <div key={flight.id} className="text-xs text-gray-700 mb-1">
                  <p>Flight: {flight.afsBookingId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Using memo to prevent unnecessary re-renders
export default memo(BookingItem);