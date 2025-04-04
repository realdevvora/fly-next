"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import the Leaflet map component to prevent SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

const HotelForm = () => {
  const [hotel, setHotel] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    location: "",
    starRating: ""
  });
  
  // State for file inputs
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Preview states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagePreviewsMap, setImagePreviewsMap] = useState<Map<string, string>>(new Map());
  
  // Map state
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHotel((prev) => ({ ...prev, [name]: value }));
    
    // Clear map error when location changes
    if (name === "location") {
      setMapError(null);
    }
  };
  
  // Parse coordinates with better error handling
  const parseCoordinates = (locationString: string): { lat: number; lng: number } | null => {
    try {
      // Remove any extra spaces and split by comma
      const parts = locationString.split(',').map(part => part.trim());
      
      if (parts.length !== 2) {
        throw new Error("Expected format: latitude,longitude");
      }
      
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Coordinates must be numbers");
      }
      
      if (lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      
      if (lng < -180 || lng > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      
      return { lat, lng };
    } catch (error) {
      if (error instanceof Error) {
        setMapError(error.message);
      } else {
        setMapError("Invalid coordinates format");
      }
      return null;
    }
  };
  
  // Function to validate and update map coordinates
  const validateAndShowMap = () => {
    if (!hotel.location.trim()) {
      setMapError("Please enter coordinates");
      setMapCoordinates(null);
      return;
    }
    
    const coordinates = parseCoordinates(hotel.location);
    
    if (coordinates) {
      setMapCoordinates(coordinates);
      setMapError(null);
    } else {
      // Error is already set by parseCoordinates
      setMapCoordinates(null);
    }
  };
  
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for each file
      const previews = new Map(imagePreviewsMap);
      newFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        previews.set(file.name, previewUrl);
      });
      setImagePreviewsMap(previews);
    }
  };
  
  const removeImage = (index: number) => {
    const fileToRemove = imageFiles[index];
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
    
    // Remove preview URL
    const updatedPreviews = new Map(imagePreviewsMap);
    updatedPreviews.delete(fileToRemove.name);
    setImagePreviewsMap(updatedPreviews);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!hotel.name || !hotel.address || !hotel.city || !hotel.country || !hotel.location || !hotel.starRating) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Validate coordinates before submit
    const coordinates = parseCoordinates(hotel.location);
    if (!coordinates) {
      alert("Please enter valid location coordinates");
      return;
    }
    
    // Validate at least one image is uploaded
    if (imageFiles.length === 0) {
      alert("Please upload at least one hotel image");
      return;
    }
    
    // Create form data for multipart/form-data submission
    const formData = new FormData();
    
    // Add text fields
    Object.entries(hotel).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    
    // Add logo file if present
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    
    // Add all hotel images
    imageFiles.forEach(file => {
      formData.append("images", file);
    });
    
    try {
      const response = await fetch("/api/hotel", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Hotel added:", data);
        alert("Hotel added successfully!");
        
        // Reset form
        setHotel({
          name: "",
          address: "",
          city: "",
          country: "",
          location: "",
          starRating: ""
        });
        setLogoFile(null);
        setLogoPreview(null);
        setImageFiles([]);
        setImagePreviewsMap(new Map());
        setMapCoordinates(null);
      } else {
        console.error("Error:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Failed to add hotel. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Hotel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hotel Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hotel Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={hotel.name}
            placeholder="Hotel Name"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Address */}
        <div className="col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={hotel.address}
            placeholder="Address"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        {/* City & Country */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={hotel.city}
            placeholder="City"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={hotel.country}
            placeholder="Country"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Location & Star Rating */}
        <div className="col-span-2">
  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Location (coordinates) *
  </label>
  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
    <div className="flex-grow">
      <input
        type="text"
        id="location"
        name="location"
        value={hotel.location}
        placeholder="e.g. 40.7128, -74.0060"
        className={`border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
          mapError ? 'border-red-500' : ''
        }`}
        onChange={handleChange}
        required
      />
    </div>
    <div className="sm:w-auto">
      <button 
        type="button"
        onClick={validateAndShowMap}
        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded font-medium whitespace-nowrap"
      >
        Show on Map
      </button>
    </div>
  </div>
  {mapError && (
    <p className="text-red-500 text-xs mt-1">{mapError}</p>
  )}
</div>

        {/* Map Display */}
      <div className="mb-6 col-span-2">
        <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Map Location Preview
        </h3>
        {mapCoordinates ? (
          <MapComponent center={mapCoordinates} zoom={13} />
        ) : (
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              {mapError ? "Invalid coordinates" : "Click 'Show on Map' to preview location"}
            </p>
          </div>
        )}
      </div>
        
        <div>
          <label htmlFor="starRating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Star Rating *
          </label>
          <select
            id="starRating"
            name="starRating"
            value={hotel.starRating}
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          >
            <option value="">Select Rating</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>
    
      
      {/* Logo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hotel Logo
        </label>
        <div className="flex items-center space-x-4">
          {logoPreview && (
            <div className="relative w-20 h-20 border rounded overflow-hidden">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                aria-label="Remove logo"
              >
                ×
              </button>
            </div>
          )}
          <input
            aria-label="Upload hotel logo"
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              dark:file:bg-blue-900 dark:file:text-blue-300
              hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
          />
        </div>
      </div>
      
      {/* Hotel Images Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hotel Images * (at least one required)
        </label>
        <input
          aria-label="Upload hotel images"
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            dark:file:bg-blue-900 dark:file:text-blue-300
            hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
        />
        
        {/* Preview uploaded images */}
        {imageFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Uploaded Images ({imageFiles.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative h-24 border rounded overflow-hidden">
                  <Image
                    src={imagePreviewsMap.get(file.name) || ''}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
      >
        Add Hotel
      </button>
    </form>
  );
};

export default HotelForm;