'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@/components/Button";
import Image from "next/image";
import { useTheme } from "next-themes"; // Correct import for next-themes

// Define types based on API response
interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  totalRooms: number;
  bookingsCount: number;
  images: string[];
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  location: string;
  starRating: number;
  createdAt: string;
  updatedAt: string;
  totalRooms: number;
  totalBookings: number;
  roomTypesCount: number;
  roomTypes: RoomType[];
  images: string[];
  logo?: string;
}

// Define tabs
type ViewTab = "browse" | "my-hotels";

const HotelsPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme(); // Get current theme
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("browse");
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [myHotels, setMyHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [activeRoomTypeIndex, setActiveRoomTypeIndex] = useState<number>(0);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all hotels (for browse view) regardless of auth status
  useEffect(() => {
    const fetchAllHotels = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/hotel/view/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }
    
        const data = await response.json();
        console.log("Fetched all hotels:", data);
        setAllHotels(data.hotels || []);
      } catch (err) {
        console.error("Error fetching all hotels:", err);
        setError("Failed to load hotels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllHotels();
  }, []);

  useEffect(() => {
    const fetchMyHotels = async () => {
      if (!isLoggedIn) return;
      
      setLoading(true);
      try {
        const response = await fetch("/api/hotel/view", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch your hotels");
        }
    
        const data = await response.json();
        console.log("Fetched my hotels:", data);
        setMyHotels(data.hotels || []);
      } catch (err) {
        console.error("Error fetching my hotels:", err);
        setError("Failed to load your hotels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyHotels();
  }, [isLoggedIn]); // Re-fetch when login status changes
  
  // With this modified version that only switches to My Hotels if the user logs in,
  // but preserves the browse tab for non-logged in users:
  
  useEffect(() => {
    // If user is not logged in and tries to access "my-hotels" tab
    if (!isLoggedIn && !authLoading && activeTab === "my-hotels") {
      // Redirect non-logged users away from "my-hotels" tab
      setActiveTab("browse");
    }
    // Logged-in users can freely access both tabs with no automatic switching
  }, [isLoggedIn, authLoading, activeTab]);

  const handleShowDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setActiveRoomTypeIndex(0);
    setActiveImageIndex(0);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedHotel(null);
  };

  const getStarRating = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const nextRoomTypeImage = () => {
    if (!selectedHotel || !selectedHotel.roomTypes[activeRoomTypeIndex]) return;
    
    const images = selectedHotel.roomTypes[activeRoomTypeIndex].images;
    if (activeImageIndex < images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    } else {
      setActiveImageIndex(0);
    }
  };

  const prevRoomTypeImage = () => {
    if (!selectedHotel || !selectedHotel.roomTypes[activeRoomTypeIndex]) return;
    
    const images = selectedHotel.roomTypes[activeRoomTypeIndex].images;
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    } else {
      setActiveImageIndex(images.length - 1);
    }
  };

  const selectRoomType = (index: number) => {
    setActiveRoomTypeIndex(index);
    setActiveImageIndex(0);
  };

  // Prevent rendering with wrong theme
  if (!mounted) {
    return null;
  }

  // Render loading state
  if (loading && activeTab === "browse" && allHotels.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 bg-gray-100 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="dark:text-gray-300 text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (loading && activeTab === "my-hotels" && myHotels.length === 0 && isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 bg-gray-100 transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="dark:text-gray-300 text-gray-600">Loading your hotels...</p>
        </div>
      </div>
    );
  }

  // Get current hotels based on active tab
  const currentHotels = activeTab === "browse" ? allHotels : myHotels;
  
  return (
    <div className="mt-20 min-h-screen p-4 dark:bg-gray-900 bg-gray-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Hotels</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b mb-6 dark:border-gray-700">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "browse"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Hotels
          </button>
          
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "my-hotels"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            } ${!isLoggedIn ? "opacity-50" : ""}`}
            onClick={() => {
              if (isLoggedIn) {
                setActiveTab("my-hotels");
              } else {
                router.push('/login');
              }
            }}
            disabled={authLoading}
          >
            My Hotels {!isLoggedIn && "(Login Required)"}
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">
            {activeTab === "browse" ? "Browse Hotels" : "My Hotels"}
          </h1>
          
          {activeTab === "my-hotels" && isLoggedIn && (
            <Button 
              onClick={() => router.push('/hotel-mgmt/management')}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-900 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Add New Hotel
            </Button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {activeTab === "my-hotels" && !isLoggedIn ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center transition-colors duration-200">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please log in to view and manage your hotels.</p>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Log In
            </Button>
          </div>
        ) : currentHotels.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center transition-colors duration-200">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {activeTab === "browse" 
                ? "No hotels available at the moment." 
                : "You don't have any hotels yet."}
            </p>
            {activeTab === "my-hotels" && (
              <Button 
                onClick={() => router.push('/hotel-mgmt/management')}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-900 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Create Your First Hotel
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentHotels.map((hotel) => (
              <div key={hotel.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
                {/* Hotel Image */}
                <div className="relative w-full h-48">
                  {hotel.images && hotel.images.length > 0 ? (
                    <Image
                      src={hotel.images[0]}
                      alt={hotel.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : hotel.logo ? (
                    <Image
                      src={hotel.logo}
                      alt={hotel.name}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-gray-400 dark:text-gray-500">No image available</span>
                    </div>
                  )}
                  {/* Hotel rating overlay */}
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 px-2 py-1 rounded text-yellow-500">
                    {getStarRating(hotel.starRating)}
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 dark:text-white">{hotel.name}</h2>
                  
                  {/* Location with icon */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{hotel.city}, {hotel.country}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    {activeTab === "my-hotels" ? (
                      <>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">Room Types</p>
                          <p className="dark:text-white">{hotel.roomTypesCount}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">Total Rooms</p>
                          <p className="dark:text-white">{hotel.totalRooms}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">Bookings</p>
                          <p className="dark:text-white">{hotel.totalBookings}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">ID</p>
                          <p className="truncate text-xs dark:text-white" title={hotel.id}>{hotel.id.substring(0, 8)}...</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">Room Types</p>
                          <p className="dark:text-white">{hotel.roomTypesCount}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded transition-colors duration-200">
                          <p className="font-medium dark:text-gray-300">Price From</p>
                          <p className="dark:text-white">${hotel.roomTypes.length > 0 
                            ? Math.min(...hotel.roomTypes.map(rt => rt.pricePerNight)).toFixed(2)
                            : "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => handleShowDetails(hotel)}
                      className={`px-6 py-2 rounded-lg text-sm w-full transition-colors duration-200 ${
                        activeTab === "browse"
                          ? "bg-green-600 hover:bg-green-700 text-white dark:text-gray-800"
                          : "bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-800"
                      }`}
                    >
                      {activeTab === "browse" ? "View Hotel" : "View Details"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Hotel Details Modal */}
        {showDetails && selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center z-10 transition-colors duration-200">
                <h3 className="text-xl font-bold dark:text-white">{selectedHotel.name} Details</h3>
                <button 
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {/* Hotel Images Carousel */}
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  {selectedHotel.images && selectedHotel.images.length > 0 ? (
                    <Image
                      src={selectedHotel.images[0]}
                      alt={selectedHotel.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-gray-400 dark:text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 text-white">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Hotel ID</p>
                      <p className="font-mono text-xs break-all dark:text-gray-300">{selectedHotel.id}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Star Rating</p>
                      <p className="text-yellow-500">{getStarRating(selectedHotel.starRating)}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Total Rooms</p>
                      <p className="dark:text-white">{selectedHotel.totalRooms}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Created</p>
                      <p className="dark:text-white">{new Date(selectedHotel.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Last Updated</p>
                      <p className="dark:text-white">{new Date(selectedHotel.updatedAt).toLocaleDateString()}</p>
                    </div>
                    {activeTab === "my-hotels" && (
                      <div className="mb-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total Bookings</p>
                        <p className="dark:text-white">{selectedHotel.totalBookings}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <h4 className="font-semibold mb-3 border-b dark:border-gray-700 pb-2 dark:text-white">Room Types ({selectedHotel.roomTypesCount})</h4>
                
                {selectedHotel.roomTypes.length > 0 ? (
                  <div>
                    {/* Room Type Tabs */}
                    <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
                      {selectedHotel.roomTypes.map((roomType, index) => (
                        <button
                          key={roomType.id}
                          onClick={() => selectRoomType(index)}
                          className={`px-4 py-2 whitespace-nowrap text-sm rounded-lg transition-colors duration-200 ${
                            activeRoomTypeIndex === index
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {roomType.name}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected Room Type Details */}
                    {selectedHotel.roomTypes[activeRoomTypeIndex] && (
                      <div className="border dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
                        {/* Room Type Images */}
                        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700">
                          {selectedHotel.roomTypes[activeRoomTypeIndex].images && 
                           selectedHotel.roomTypes[activeRoomTypeIndex].images.length > 0 ? (
                            <>
                              <Image
                                src={selectedHotel.roomTypes[activeRoomTypeIndex].images[activeImageIndex]}
                                alt={selectedHotel.roomTypes[activeRoomTypeIndex].name}
                                fill
                                style={{ objectFit: 'cover' }}
                              />
                              
                              {/* Image Navigation */}
                              {selectedHotel.roomTypes[activeRoomTypeIndex].images.length > 1 && (
                                <>
                                  <button
                                    aria-label="Previous Image"
                                    onClick={prevRoomTypeImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 flex items-center justify-center rounded-full"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    aria-label="Next Image"
                                    onClick={nextRoomTypeImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 flex items-center justify-center rounded-full"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </>
                              )}
                              
                              {/* Image Counter */}
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
                                {activeImageIndex + 1} / {selectedHotel.roomTypes[activeRoomTypeIndex].images.length}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500">No images available</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Room Type Info */}
                        <div className="p-4 dark:bg-gray-800 transition-colors duration-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-lg dark:text-white">{selectedHotel.roomTypes[activeRoomTypeIndex].name}</h5>
                              <p className="text-blue-600 dark:text-blue-400 font-medium">
                                ${selectedHotel.roomTypes[activeRoomTypeIndex].pricePerNight.toFixed(2)} per night
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm dark:text-gray-300">
                                <span className="font-medium">{selectedHotel.roomTypes[activeRoomTypeIndex].totalRooms}</span> rooms
                              </p>
                              {activeTab === "my-hotels" && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">{selectedHotel.roomTypes[activeRoomTypeIndex].bookingsCount}</span> bookings
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {activeTab === "browse" ? (
                            <div className="mt-4">
                              <Button 
                                className="w-full bg-green-600 hover:bg-green-700 text-white dark:text-gray-800 py-2 rounded-lg transition-colors duration-200"
                                onClick={() => router.push(`/booking/itinerary}`)}
                              >
                                Book Now
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Room Type ID: {selectedHotel.roomTypes[activeRoomTypeIndex].id}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No room types defined yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;