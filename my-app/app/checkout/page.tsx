'use client';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@/components/Button";
import BookingItem, { Booking, CheckoutFormData } from "@/components/bookingComponents/BookingItem";
import Input from "@/components/Input";
import CheckoutModal from "@/components/bookingComponents/CheckoutModal";

const UserBookings: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  // Only run the fetch if we're on the bookings route (for example, not on "/checkout")
  const shouldFetch = pathname === "/checkout";

  // Initialize with empty arrays/objects to prevent hydration mismatches
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);
  const [pdfData, setPdfData] = useState<{ [key: string]: Uint8Array }>({});
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData>({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
  });
  const [processingCheckout, setProcessingCheckout] = useState<boolean>(false);
  const [checkoutResults, setCheckoutResults] = useState<{ 
    successful: string[];
    failed: string[];
  }>({ successful: [], failed: [] });

  // Authentication check and redirect
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    if (!shouldFetch || !isLoggedIn || authLoading) {
      // Skip fetching if not on the bookings page or not authenticated yet
      return;
    }
    
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/bookings", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        // Filter for only PENDING bookings
        const pendingBookings = data.bookings.filter(
          (booking: Booking) => booking.status === "PENDING"
        );
        // Format amounts to ensure they're numbers
        const formattedBookings: Booking[] = pendingBookings.map((booking: Booking) => ({
          ...booking,
          totalAmount: booking.totalPrice,
        }));
        if (isMounted) {
          setBookings(formattedBookings);
        }
      } catch (error) {
        if (isMounted) {
          setError("Error fetching your bookings. Please try again.");
        }
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [shouldFetch, isLoggedIn, authLoading]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    setError("");
    try {
      // Find the booking to get flight references
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }
      // Cancel any associated flights first
      if (booking.flightBookingReferences && booking.flightBookingReferences.length > 0) {
        for (const flight of booking.flightBookingReferences) {
          try {
            const lastName = prompt("Please enter your last name to confirm flight cancellation:");
            if (!lastName) {
              continue;
            }
            const flightCancelResponse = await fetch("/api/flights/cancel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lastName: lastName,
                flightBookingReferenceId: flight.id,
              }),
            });
            if (!flightCancelResponse.ok) {
              console.error(`Failed to cancel flight ${flight.id}`);
            }
          } catch (flightError) {
            console.error(`Error cancelling flight ${flight.id}:`, flightError);
          }
        }
      }
      // Then cancel the main booking
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }
      // Update local state
      setBookings(prev => prev.filter((booking) => booking.id !== bookingId));
      setSelectedBookings(prev => prev.filter((id) => id !== bookingId));
    } catch (error) {
      setError("Error cancelling booking. Please try again.");
      console.error(error);
    }
  };

  const toggleBookingSelection = (bookingId: string, isSelected: boolean) => {
    setSelectedBookings(prev => {
      return isSelected ? [...prev, bookingId] : prev.filter(id => id !== bookingId);
    });
  };

  const handleCheckoutFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCheckoutFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookings.length === 0) {
      setError("Please select at least one booking to checkout");
      return;
    }
    setProcessingCheckout(true);
    setError("");
    const successful: string[] = [];
    const failed: string[] = [];
    // Process each selected booking
    for (const bookingId of selectedBookings) {
      try {
        // Process payment
        const paymentResponse = await fetch("/api/bookings/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            cardholderName: checkoutFormData.cardholderName,
            cardNumber: checkoutFormData.cardNumber,
            expiryDate: checkoutFormData.expiryDate,
          }),
        });
        if (!paymentResponse.ok) {
          failed.push(bookingId);
          continue;
        }
        // Generate invoice
        const invoiceResponse = await fetch(`/api/bookings/${bookingId}/invoice`);
        if (invoiceResponse.ok) {
          const pdfBlob = await invoiceResponse.blob();
          const pdfArrayBuffer = await pdfBlob.arrayBuffer();
          setPdfData(prev => ({
            ...prev,
            [bookingId]: new Uint8Array(pdfArrayBuffer)
          }));
          successful.push(bookingId);
        } else {
          failed.push(bookingId);
        }
      } catch (error) {
        console.error(`Error processing booking ${bookingId}:`, error);
        failed.push(bookingId);
      }
    }
    setCheckoutResults({ successful, failed });
    // Remove successful bookings from the list
    setBookings(prev => prev.filter(booking => !successful.includes(booking.id)));
    setSelectedBookings(prev => prev.filter(id => !successful.includes(id)));
    setProcessingCheckout(false);
  };

  const openPdfInNewTab = (bookingId: string) => {
    if (pdfData[bookingId]) {
      const pdfBlob = new Blob([pdfData[bookingId]], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    }
  };

  // Card validation patterns
  const cardNumberPattern = "^[0-9]{16}$";
  const expiryDatePattern = "^(0[1-9]|1[0-2])\\/([0-9]{2})$";

  // Show loading state while checking authentication or loading bookings
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render the content (the useEffect will handle redirect)
  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="mt-20 min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Pending Bookings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {checkoutResults.successful.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">
              Successfully processed {checkoutResults.successful.length} bookings!
            </p>
            <div className="mt-2">
              {checkoutResults.successful.map((bookingId) => (
                <Button 
                  key={bookingId}
                  onClick={() => openPdfInNewTab(bookingId)} 
                  className="bg-green-600 text-sm px-3 py-1 rounded-lg mr-2 mb-2"
                >
                  Invoice for #{bookingId.slice(0, 8)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {checkoutResults.failed.length > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>
              Failed to process {checkoutResults.failed.length} bookings. Please try again later.
            </p>
          </div>
        )}
        
        {bookings.length === 0 ? (
          <div className="p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">You don't have any pending bookings.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p>{bookings.length} pending bookings found</p>
              {bookings.length > 0 && selectedBookings.length > 0 && (
                <Button 
                  onClick={() => setShowCheckoutForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  type="button"
                >
                  Checkout ({selectedBookings.length})
                </Button>
              )}
            </div>
            
            {bookings.map((booking) => (
              <BookingItem 
                key={booking.id} 
                booking={booking} 
                onCancel={handleCancelBooking}
                isSelected={selectedBookings.includes(booking.id)}
                onSelect={toggleBookingSelection}
              />
            ))}
          </>
        )}
        
        {/* Checkout Modal */}
        {showCheckoutForm && selectedBookings.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <CheckoutModal 
              onClose={() => setShowCheckoutForm(false)} 
              onSubmit={handleCheckout} 
              formData={checkoutFormData} 
              onChange={handleCheckoutFormChange} 
              processing={processingCheckout}
              cardNumberPattern={cardNumberPattern}
              expiryDatePattern={expiryDatePattern}
              error={error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;