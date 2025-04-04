import FlightsPage from "@/components/flightComponents/FlightSearchPage";
import React from "react";
import { ItineraryProvider } from "@/components/contexts/ItineraryContext";

export default function FlightSearch() {
  return (
    <main className="flex-grow pt-24">
      <ItineraryProvider>
          <FlightsPage />
      </ItineraryProvider>
    </main>
  )
}