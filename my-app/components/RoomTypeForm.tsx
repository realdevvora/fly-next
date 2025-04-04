"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";

interface HotelOption {
  id: string;
  name: string;
}

const RoomTypeForm = () => {
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [roomType, setRoomType] = useState({
    name: "",
    description: "",
    hotelId: "",
    pricePerNight: "",
    totalRooms: "",
    amenities: [] as string[]
  });
  
  // For amenity input
  const [amenityInput, setAmenityInput] = useState("");
  
  // For image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewsMap, setImagePreviewsMap] = useState<Map<string, string>>(new Map());
  
  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch("/api/hotel/owned", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHotels(data.hotels || []);
        } else {
          console.error("Failed to fetch hotels");
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
    
    fetchHotels();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoomType((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddAmenity = () => {
    if (amenityInput.trim() && !roomType.amenities.includes(amenityInput.trim())) {
      setRoomType((prev) => ({ 
        ...prev, 
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput("");
    }
  };
  
  const handleRemoveAmenity = (index: number) => {
    setRoomType((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
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
    setLoading(true);
    setSubmitStatus(null);
    
    try {
      // Validate form data
      if (!roomType.name || !roomType.description || !roomType.hotelId || 
          !roomType.pricePerNight || !roomType.totalRooms || roomType.amenities.length === 0 || imageFiles.length === 0) {
        setSubmitStatus({
          type: 'error',
          message: 'Please fill in all required fields and upload at least one image'
        });
        setLoading(false);
        return;
      }
      
      // Create form data for direct submission with images
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', roomType.name);
      formData.append('description', roomType.description);
      formData.append('hotelId', roomType.hotelId);
      formData.append('pricePerNight', roomType.pricePerNight);
      formData.append('totalRooms', roomType.totalRooms);
      
      // Add amenities as JSON string
      formData.append('amenities', JSON.stringify(roomType.amenities));
      
      // Add image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      // Submit the form data directly to the roomtype API
      const response = await fetch('/api/hotel/room', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Room type added successfully!'
        });
        
        // Reset form
        setRoomType({
          name: "",
          description: "",
          hotelId: "",
          pricePerNight: "",
          totalRooms: "",
          amenities: []
        });
        setImageFiles([]);
        setImagePreviewsMap(new Map());
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to add room type'
        });
      }
    } catch (error) {
      console.error('Error adding room type:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Room Type</h2>
      
      {submitStatus && (
        <div className={`mb-4 p-3 rounded ${
          submitStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {submitStatus.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Hotel Selection */}
        <div className="col-span-2">
          <label htmlFor="hotelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Hotel *
          </label>
          <select
            id="hotelId"
            name="hotelId"
            value={roomType.hotelId}
            onChange={handleChange}
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            required
          >
            <option value="">-- Select a hotel --</option>
            {hotels.map(hotel => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Room Type Name */}
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Room Type Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={roomType.name}
            placeholder="e.g. Deluxe Suite, Standard Double"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Description */}
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={roomType.description}
            placeholder="Describe the room type"
            rows={3}
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Price & Number of Rooms */}
        <div>
          <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price per Night ($) *
          </label>
          <input
            type="number"
            id="pricePerNight"
            name="pricePerNight"
            value={roomType.pricePerNight}
            placeholder="e.g. 99.99"
            min="0"
            step="0.01"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total Number of Rooms *
          </label>
          <input
            type="number"
            id="totalRooms"
            name="totalRooms"
            value={roomType.totalRooms}
            placeholder="e.g. 10"
            min="1"
            step="1"
            className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      {/* Amenities */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amenities *
        </label>
        <div className="flex mb-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            placeholder="e.g. Wi-Fi, TV, Mini-bar"
            className="border p-2 flex-grow rounded-l dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleAddAmenity}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r"
          >
            Add
          </button>
        </div>
        
        {roomType.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {roomType.amenities.map((amenity, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <span className="text-sm text-gray-800 dark:text-gray-200">{amenity}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(index)}
                  className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {roomType.amenities.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add at least one amenity
          </p>
        )}
      </div>
      
      {/* Room Images Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Room Images * (at least one required)
        </label>
        <input
          aria-label="Upload room images"
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            dark:file:bg-green-900 dark:file:text-green-300
            hover:file:bg-green-100 dark:hover:file:bg-green-800"
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
        disabled={loading}
        className={`w-full ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600' 
            : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
        } text-white p-3 rounded font-medium`}
      >
        {loading ? 'Adding Room Type...' : 'Add Room Type'}
      </button>
    </form>
  );
};

export default RoomTypeForm;