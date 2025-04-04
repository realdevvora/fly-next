"use client";
import React, { useState, useEffect } from "react";

type RoomAvailability = {
  roomType: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
};

// Separate type for room types with IDs
type RoomType = {
  id: string;
  name: string;
  totalRooms: number;
};

const RoomAvailabilityManager = () => {
  const [hotelId, setHotelId] = useState("");
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [allRoomTypes, setAllRoomTypes] = useState<RoomType[]>([]);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [selectedRoomTypeName, setSelectedRoomTypeName] = useState("");
  const [newTotalRooms, setNewTotalRooms] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default to 7 days from now
  });

  // Fetch all room types (we need this for the IDs)
  const fetchAllRoomTypes = async () => {
    if (!hotelId) {
      setError("Please enter a hotel ID");
      return;
    }
    
    setLoadingRoomTypes(true);
    setError("");
    
    try {
      // This assumes you have an API endpoint that returns all room types with their IDs
      // If you don't have this endpoint, you would need to create it
      const response = await fetch(`/api/hotel/${hotelId}/roomTypes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch room types");
      }
      
      const data = await response.json();
      // Fix: The API returns { roomTypes: [...] } instead of [...], so we need to access the roomTypes property
      setAllRoomTypes(data.roomTypes || []);
    } catch (error: any) {
      console.error("Error fetching room types:", error);
      setError(`Error fetching room types: ${error.message}`);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  // Fetch room availability
  const fetchAvailability = async () => {
    if (!hotelId) {
      setError("Please enter a hotel ID");
      return;
    }
    
    setLoadingAvailability(true);
    setError("");
    
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      
      const response = await fetch(
        `/api/hotel/${hotelId}/availability?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch availability");
      }
      
      const data = await response.json();
      setAvailability(data);
    } catch (error: any) {
      setError(`Error fetching availability: ${error.message}`);
      console.error("Error fetching availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Update room availability
  const handleUpdate = async () => {
    if (!hotelId) {
      setError("Please enter a hotel ID");
      return;
    }
    
    if (!roomTypeId) {
      setError("Please select a room type");
      return;
    }
    
    if (newTotalRooms <= 0) {
      setError("Total rooms must be a positive number");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`/api/hotel/${hotelId}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomTypeId,
          newTotalRooms,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update availability");
      }
      
      setSuccess("Room availability updated successfully!");
      
      // Refresh the availability data
      fetchAvailability();
    } catch (error: any) {
      setError(`Error updating availability: ${error.message}`);
      console.error("Error updating availability:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get room type ID by name
  const getRoomTypeIdByName = (name: string) => {
    const roomType = allRoomTypes.find(rt => rt.name === name);
    return roomType?.id || "";
  };

  // Handler for hotel ID changes
  const handleHotelIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHotelId(e.target.value);
    // Clear data when hotel ID changes
    setAvailability([]);
    setAllRoomTypes([]);
    setRoomTypeId("");
    setSelectedRoomTypeName("");
    setNewTotalRooms(0);
    setError("");
    setSuccess("");
  };

  // Load data when hotel ID is set
  useEffect(() => {
    if (hotelId) {
      fetchAllRoomTypes();
      fetchAvailability();
    }
  }, [hotelId]);

  // Update data when date range changes (only if hotelId exists)
  useEffect(() => {
    if (hotelId) {
      fetchAvailability();
    }
  }, [dateRange.startDate, dateRange.endDate]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Room Availability Manager</h2>
      
      {/* Hotel ID Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Hotel Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hotel ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={hotelId}
              onChange={handleHotelIdChange}
              placeholder="Enter hotel ID"
              className="border p-2 flex-grow rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <button
              onClick={() => {
                if (hotelId) {
                  fetchAllRoomTypes();
                  fetchAvailability();
                } else {
                  setError("Please enter a hotel ID");
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Load
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:text-red-100 rounded">
          {error}
        </div>
      )}
      
      {/* Date Range Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              aria-label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              aria-label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border p-2 w-full rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        
        <button
          onClick={fetchAvailability}
          disabled={loadingAvailability || !hotelId}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAvailability ? "Loading..." : "Refresh Availability"}
        </button>
      </div>
      
      {/* Room Types Availability Table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold dark:text-white mb-3">Current Availability</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Room Type</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Total Rooms</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Booked</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Available</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingAvailability ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center dark:text-white">
                    Loading availability data...
                  </td>
                </tr>
              ) : !hotelId ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center dark:text-white">
                    Please enter a hotel ID to view availability.
                  </td>
                </tr>
              ) : availability.length > 0 ? (
                availability.map((room, index) => (
                  <tr key={index} className="border-t dark:border-gray-600">
                    <td className="px-4 py-3 dark:text-white">{room.roomType}</td>
                    <td className="px-4 py-3 dark:text-white">{room.totalRooms}</td>
                    <td className="px-4 py-3 dark:text-white">{room.bookedRooms}</td>
                    <td className="px-4 py-3 dark:text-white">{room.availableRooms}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          const id = getRoomTypeIdByName(room.roomType);
                          setRoomTypeId(id);
                          setSelectedRoomTypeName(room.roomType);
                          setNewTotalRooms(room.totalRooms);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                        disabled={loadingRoomTypes || !allRoomTypes.length}
                      >
                        {loadingRoomTypes ? "Loading..." : "Select"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center dark:text-white">
                    No room types available for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Update Form - Only visible when a hotel ID is provided */}
      {hotelId && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold dark:text-white mb-3">Update Room Availability</h3>
          
          {success && (
            <div className="mb-4 p-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selected Room Type
              </label>
              <select
                aria-label="Select Room Type"
                value={roomTypeId}
                onChange={(e) => {
                  setRoomTypeId(e.target.value);
                  // Find the room type by ID
                  const roomType = allRoomTypes.find(rt => rt.id === e.target.value);
                  if (roomType) {
                    setSelectedRoomTypeName(roomType.name);
                    
                    // Find the current availability for this room type
                    const availabilityItem = availability.find(a => a.roomType === roomType.name);
                    if (availabilityItem) {
                      setNewTotalRooms(availabilityItem.totalRooms);
                    } else {
                      setNewTotalRooms(roomType.totalRooms);
                    }
                  }
                }}
                className="border p-2 w-full rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value="">Select a room type</option>
                {Array.isArray(allRoomTypes) && allRoomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Total Rooms
              </label>
              <input
                aria-label="New Total Rooms"
                type="number"
                min="1"
                value={newTotalRooms}
                onChange={(e) => setNewTotalRooms(Number(e.target.value))}
                className="border p-2 w-full rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            </div>
            
            <button
              onClick={handleUpdate}
              disabled={loading || !roomTypeId}
              className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white p-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Availability"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailabilityManager;