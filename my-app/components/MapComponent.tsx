"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";



interface MapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {


    // Initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      // Add a marker at the center coordinates
      markerRef.current = L.marker([center.lat, center.lng]).addTo(mapRef.current);
      
      // Add a popup with coordinates to the marker
      markerRef.current.bindPopup(`
        <strong>Location</strong><br>
        Latitude: ${center.lat.toFixed(4)}<br>
        Longitude: ${center.lng.toFixed(4)}
      `);
    }

    return () => {
      // Clean up the map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      // Update map view
      mapRef.current.setView([center.lat, center.lng], zoom);
      
      // Update marker position
      markerRef.current.setLatLng([center.lat, center.lng]);
      
      // Update popup content
      markerRef.current.bindPopup(`
        <strong>Location</strong><br>
        Latitude: ${center.lat.toFixed(4)}<br>
        Longitude: ${center.lng.toFixed(4)}
      `);
    }
  }, [center, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-64 rounded overflow-hidden border border-gray-300 dark:border-gray-600" 
    />
  );
};

export default MapComponent;