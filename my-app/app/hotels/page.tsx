'use client';
import HotelSearchPage from "@/components/hotelComponents/HotelSearchPage";
import React from "react";
import { ItineraryProvider } from "@/components/contexts/ItineraryContext";
import { BookingData } from "@/types";

export default function Hotels() {
  function onBookRoom(data: BookingData) {
    // Ensure flightIds is handled properly
    if (!data.flightIds) {
      console.error('Missing flightIds in booking data');
      return;
    }
    console.log('Hotel booking data received:', data);
  }

  return (
    <main className="flex-grow pt-24 flex justify-center">
      <div className="w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <ItineraryProvider>
          <HotelSearchPage onBookRoom={onBookRoom}/>
        </ItineraryProvider>
      </div>
    </main>
  );
}