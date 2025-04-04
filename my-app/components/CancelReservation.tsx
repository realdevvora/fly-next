"use client";
import React, { useState } from "react";

const CancelReservation = () => {
  const [reservationId, setReservationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    if (!reservationId) {
      setMessage("Please enter a reservation ID.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const response = await fetch(`/api/bookings/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel reservation");
      }
      
      setMessage("Reservation cancelled successfully.");
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Cancel Reservation</h2>
      <input
        type="text"
        placeholder="Reservation ID"
        className="border p-2 w-full mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={reservationId}
        onChange={(e) => setReservationId(e.target.value)}
      />
      <button
        onClick={handleCancel}
        className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Cancelling..." : "Cancel"}
      </button>
      {message && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">{message}</p>
      )}
    </div>
  );
};

export default CancelReservation;