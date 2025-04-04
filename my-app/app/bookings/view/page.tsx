'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/*
    This is the view bookings page.
    It displays all bookings made by the currently logged in user.
*/
// Define interfaces based on the provided types
interface RoomBooking {
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
    };
    // Original fields
    numberOfRooms?: number;
    numberOfGuests?: number;
    checkIn?: string;
    checkOut?: string;
    // New fields based on the provided structure
    bookingId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    hotelId?: string;
    roomTypeId?: string;
    totalPrice: number;
}

interface FlightBookingReference {
    id: string;
    airline: string;
    referenceNumber: string;
    departureDate?: string;
    afsBookingId?: string;
    passengerCount?: number;
    totalPrice?: number;
    // Add additional fields from the sample data
    flightDetails?: {
        outbound?: {
            departureTime: string;
            arrivalTime: string;
            departureAirport: string;
            arrivalAirport: string;
            flightNumber: string;
        };
        return?: {
            departureTime: string;
            arrivalTime: string;
            departureAirport: string;
            arrivalAirport: string;
            flightNumber: string;
        };
    };
}

interface PaymentInfo {
    lastFourDigits: string;
    cardholderName: string;
}

interface Booking {
    id: string;
    bookingReference?: string;
    bookingDate: string;
    status: string;
    roomBookings: RoomBooking[];
    flightBookingReferences: FlightBookingReference[];
    paymentInfo: PaymentInfo;
    totalPrice: number;
    flightSearchParams?: string;
}

export default function ViewBookings() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch bookings when component mounts and the user is logged in
        if (isLoggedIn) {
            fetchBookings();
        }
    }, [isLoggedIn]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bookings', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            console.log(data)

            if (response.ok) {
                const selectedBookings = data.bookings
                setBookings(selectedBookings);
            } else {
                setError(data.error || 'Failed to fetch bookings');
            }
        } catch (error) {
            setError('An error occurred while fetching bookings');
            console.error('Bookings fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format date to a more readable format
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Parse flight search parameters
    const parseFlightSearchParams = (paramsString?: string) => {
        if (!paramsString) return null;
        try {
            return JSON.parse(paramsString);
        } catch (error) {
            console.error('Error parsing flight search params:', error);
            return null;
        }
    };

    // Calculate total nights for a room booking
    const calculateNights = (checkIn: string, checkOut: string): number => {
        try {
            const checkInDate: Date = new Date(checkIn);
            const checkOutDate: Date = new Date(checkOut);
            
            // Check for invalid dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.warn('Invalid date detected in calculateNights');
                return 1; // Default to 1 night
            }
            
            const diffTime: number = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
            const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // If days is 0 (same day check-in/check-out), count as 1 night
            return diffDays > 0 ? diffDays : 1;
        } catch (error) {
            console.error('Error calculating nights:', error);
            return 1; // Default to 1 night on error
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700 dark:text-red-200">Please log in to view your bookings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Your Bookings
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        View all your confirmed reservations
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-200">You don't have any bookings yet.</p>
                        <Link href="/hotels" className="mt-2 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                            Browse Hotels
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => {
                            // Parse flight search params
                            const flightParams = parseFlightSearchParams(booking.flightSearchParams);
                            
                            return (
                                <div key={booking.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                    <div className="px-4 py-5 sm:px-6 border-b border-gray-100 dark:border-gray-600">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                                    Booking #{booking.bookingReference || booking.id}
                                                </h3>
                                                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                                    Booked on {formatDate(booking.bookingDate)}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                booking.status === 'CONFIRMED' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : booking.status === 'PENDING'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Room Bookings */}
                                    {booking.roomBookings?.length > 0 && (
                                        <div className="px-4 py-5 sm:px-6">
                                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Hotel Rooms</h4>
                                            <div className="space-y-4">
                                                {booking.roomBookings.map((roomBooking) => {
                                                    // Determine check-in/check-out dates based on available fields
                                                    const checkInDate = roomBooking.checkInDate || roomBooking.checkIn;
                                                    const checkOutDate = roomBooking.checkOutDate || roomBooking.checkOut;
                                                    
                                                    // Determine guest count based on available fields
                                                    const guestCount = roomBooking.guestCount || roomBooking.numberOfGuests || 1;
                                                    
                                                    // Determine room count (default to 1 if not specified)
                                                    const roomCount = roomBooking.numberOfRooms || 1;
                                                    
                                                    // Calculate nights only if both dates are available
                                                    const nights = checkInDate && checkOutDate 
                                                        ? calculateNights(checkInDate, checkOutDate)
                                                        : 1;
                                                    
                                                    return (
                                                        <div key={roomBooking.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                            <div className="ml-4 flex justify-between">
                                                                <div>
                                                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                                                                        {roomBooking.roomType.hotel.name} 
                                                                        {roomBooking.roomType.hotel.starRating && (
                                                                            <> ({roomBooking.roomType.hotel.starRating}★)</>
                                                                        )}
                                                                    </p>
                                                                    {roomBooking.roomType.hotel.city && roomBooking.roomType.hotel.country && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {roomBooking.roomType.hotel.city}, {roomBooking.roomType.hotel.country}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        {roomBooking.roomType.name} • {roomCount} room(s) • {guestCount} guest(s)
                                                                    </p>
                                                                    {checkInDate && (
                                                                        <div className="mt-2">
                                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-in:</span>
                                                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(checkInDate)}</span>
                                                                        </div>
                                                                    )}
                                                                    {checkOutDate && (
                                                                        <div>
                                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check-out:</span>
                                                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(checkOutDate)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        {nights} night{nights !== 1 ? 's' : ''}
                                                                    </p>
                                                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                        ${roomBooking.totalPrice.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Flight Bookings */}
                                    {booking.flightBookingReferences?.length > 0 && (
                                        <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Flights</h4>
                                            <div className="space-y-4">
                                                {booking.flightBookingReferences.map((flight) => (
                                                    <div key={flight.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                                                        <div className="flex justify-between">
                                                            <div className='ml-4'>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Booking ID: <span className="font-mono">{flight.afsBookingId || flight.referenceNumber}</span>
                                                                </p>
                                                                {flight.passengerCount && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        Passengers: {flight.passengerCount}
                                                                    </p>
                                                                )}
                                                                {flightParams && (
                                                                    <div className="mt-2">
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            From {flightParams.source || flightParams.sourceCode} to {flightParams.destination || flightParams.destinationCode}
                                                                        </p>
                                                                        {flightParams.departDate && (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                Depart: {formatDate(flightParams.departDate)}
                                                                                {flightParams.returnDate && <> • Return: {formatDate(flightParams.returnDate)}</>}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {flight.departureDate && !flightParams?.departDate && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                        Departure: {formatDate(flight.departureDate)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {flight.totalPrice && (
                                                                <div className="text-right">
                                                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                                        ${flight.totalPrice.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Info */}
                                    <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {booking.paymentInfo?.cardholderName && (
                                                        <>Paid by {booking.paymentInfo.cardholderName} •</>
                                                    )} 
                                                    {booking.paymentInfo?.lastFourDigits && (
                                                        <> Card ending in {booking.paymentInfo.lastFourDigits}</>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                    ${booking.totalPrice.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}