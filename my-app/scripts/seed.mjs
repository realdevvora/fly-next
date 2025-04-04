
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create admin users
  const user1 = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: await hash("password123", 10),
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "1234567890",
      profilePicture: "/uploads/profile-1742622939806-575318330.jpeg",
      prefersDarkMode: false
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      password: await hash("password456", 10),
      firstName: "Jane",
      lastName: "Smith",
      phoneNumber: "9876543210",
      profilePicture: "/uploads/profile-1742622939806-575318330.jpeg",
      prefersDarkMode: true
    },
  });

  // Create a few more regular users
  const regularUsers = [];
  const regularUserData = [
    { firstName: "Michael", lastName: "Johnson", email: "michael.j@example.com" },
    { firstName: "Emily", lastName: "Williams", email: "emily.w@example.com" },
    { firstName: "David", lastName: "Brown", email: "david.b@example.com" },
    { firstName: "Sarah", lastName: "Miller", email: "sarah.m@example.com" },
    { firstName: "Robert", lastName: "Davis", email: "robert.d@example.com" }
  ];

  for (const userData of regularUserData) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: await hash("userpass123", 10),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        profilePicture: "/uploads/profile-1742622939806-575318330.jpeg",
        prefersDarkMode: Math.random() > 0.5
      },
    });
    regularUsers.push(user);
  }
  
  // All users including admins
  const allUsers = [user1, user2, ...regularUsers];

  // Used generative AI to generate hotel & room data

  // Define hotel data with diverse locations
  const hotelData = [
    // North America
    { name: "Grand Plaza Hotel", city: "New York", country: "USA", location: "40.7128,-74.0060", starRating: 5 },
    { name: "The Manhattan Suites", city: "New York", country: "USA", location: "40.7831,-73.9712", starRating: 4 },
    { name: "Broadway Central", city: "New York", country: "USA", location: "40.7589,-73.9851", starRating: 3 },
    { name: "SoHo Luxury Hotel", city: "New York", country: "USA", location: "40.7233,-74.0030", starRating: 5 },
    { name: "Seaside Resort Miami", city: "Miami", country: "USA", location: "25.7617,-80.1918", starRating: 4 },
    { name: "Palm Beach Hotel", city: "Miami", country: "USA", location: "25.7989,-80.2040", starRating: 4 },
    { name: "Ocean View Resort", city: "Miami", country: "USA", location: "25.7742,-80.1340", starRating: 5 },
    { name: "Golden Gate Inn", city: "San Francisco", country: "USA", location: "37.7749,-122.4194", starRating: 4 },
    { name: "Bay Area Luxury Suites", city: "San Francisco", country: "USA", location: "37.7833,-122.4167", starRating: 5 },
    { name: "Hollywood Dreams Hotel", city: "Los Angeles", country: "USA", location: "34.0522,-118.2437", starRating: 4 },
    { name: "Beverly Hills Resort", city: "Los Angeles", country: "USA", location: "34.0736,-118.4004", starRating: 5 },
    { name: "Magnificent Mile Hotel", city: "Chicago", country: "USA", location: "41.8781,-87.6298", starRating: 4 },
    { name: "Waikiki Beach Resort", city: "Honolulu", country: "USA", location: "21.3069,-157.8583", starRating: 5 },
    { name: "CN Tower View Hotel", city: "Toronto", country: "Canada", location: "43.6532,-79.3832", starRating: 4 },
    { name: "Montreal Historic Inn", city: "Montreal", country: "Canada", location: "45.5017,-73.5673", starRating: 4 },
    { name: "Vancouver Harbor Hotel", city: "Vancouver", country: "Canada", location: "49.2827,-123.1207", starRating: 5 },
    
    // Europe
    { name: "Eiffel Tower View Hotel", city: "Paris", country: "France", location: "48.8566,2.3522", starRating: 5 },
    { name: "Le Petit Palais", city: "Paris", country: "France", location: "48.8661,2.3125", starRating: 4 },
    { name: "Westminster Grand", city: "London", country: "UK", location: "51.5074,-0.1278", starRating: 5 },
    { name: "The Thames View", city: "London", country: "UK", location: "51.5080,-0.1200", starRating: 4 },
    { name: "Buckingham Luxury Hotel", city: "London", country: "UK", location: "51.5014,-0.1419", starRating: 5 },
    { name: "Colosseum Suites", city: "Rome", country: "Italy", location: "41.9028,12.4964", starRating: 4 },
    { name: "Vatican View Hotel", city: "Rome", country: "Italy", location: "41.9029,12.4534", starRating: 4 },
    { name: "Grand Canal Resort", city: "Venice", country: "Italy", location: "45.4408,12.3155", starRating: 5 },
    { name: "Berlin Wall Hotel", city: "Berlin", country: "Germany", location: "52.5200,13.4050", starRating: 4 },
    { name: "Brandenburg Gate Inn", city: "Berlin", country: "Germany", location: "52.5163,13.3777", starRating: 4 },
    { name: "Plaza Mayor Hotel", city: "Madrid", country: "Spain", location: "40.4168,-3.7038", starRating: 4 },
    { name: "Gaudi Inspiration Hotel", city: "Barcelona", country: "Spain", location: "41.3851,2.1734", starRating: 5 },
    { name: "Amsterdam Canal Resort", city: "Amsterdam", country: "Netherlands", location: "52.3676,4.9041", starRating: 4 },
    { name: "Vienna Opera House Hotel", city: "Vienna", country: "Austria", location: "48.2082,16.3738", starRating: 5 },
    { name: "Charles Bridge View", city: "Prague", country: "Czech Republic", location: "50.0755,14.4378", starRating: 4 },
    
    // Asia
    { name: "Tokyo Tower Hotel", city: "Tokyo", country: "Japan", location: "35.6762,139.6503", starRating: 5 },
    { name: "Shibuya Crossing Inn", city: "Tokyo", country: "Japan", location: "35.6580,139.7016", starRating: 4 },
    { name: "Oriental Pearl Hotel", city: "Shanghai", country: "China", location: "31.2304,121.4737", starRating: 5 },
    { name: "Forbidden City Resort", city: "Beijing", country: "China", location: "39.9042,116.4074", starRating: 5 },
    { name: "Marina Bay Resort", city: "Singapore", country: "Singapore", location: "1.3521,103.8198", starRating: 5 },
    { name: "Burj Al Arab View", city: "Dubai", country: "UAE", location: "25.2048,55.2708", starRating: 5 },
    { name: "Taj Mahal View Resort", city: "Agra", country: "India", location: "27.1767,78.0081", starRating: 4 },
    { name: "Mumbai Seaside Hotel", city: "Mumbai", country: "India", location: "19.0760,72.8777", starRating: 4 },
    { name: "Bali Beachfront Resort", city: "Bali", country: "Indonesia", location: "-8.3405,115.0920", starRating: 5 },
    { name: "Seoul Tower Hotel", city: "Seoul", country: "South Korea", location: "37.5665,126.9780", starRating: 4 },
    
    // Australia/Oceania
    { name: "Sydney Harbor View", city: "Sydney", country: "Australia", location: "-33.8688,151.2093", starRating: 5 },
    { name: "Melbourne Arts Hotel", city: "Melbourne", country: "Australia", location: "-37.8136,144.9631", starRating: 4 },
    { name: "Auckland Waterfront Hotel", city: "Auckland", country: "New Zealand", location: "-36.8485,174.7633", starRating: 4 },
    
    // South America
    { name: "Copacabana Beach Resort", city: "Rio de Janeiro", country: "Brazil", location: "-22.9068,-43.1729", starRating: 5 },
    { name: "Andes View Hotel", city: "Santiago", country: "Chile", location: "-33.4489,-70.6693", starRating: 4 },
    { name: "Machu Picchu Gateway", city: "Cusco", country: "Peru", location: "-13.5320,-71.9675", starRating: 4 },
    
    // Africa
    { name: "Table Mountain View", city: "Cape Town", country: "South Africa", location: "-33.9249,18.4241", starRating: 4 },
    { name: "Pyramids View Resort", city: "Cairo", country: "Egypt", location: "30.0444,31.2357", starRating: 4 },
    { name: "Marrakech Palace Hotel", city: "Marrakech", country: "Morocco", location: "31.6295,-7.9811", starRating: 5 }
  ];

  // Create all hotels
  const hotels = [];
  for (const hotel of hotelData) {
    const randomOwner = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    const createdHotel = await prisma.hotel.create({
      data: {
        name: hotel.name,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Broadway', 'Park Ave', 'Ocean Blvd', 'Mountain View', 'Sunset Blvd', 'River Rd'][Math.floor(Math.random() * 7)]}`,
        city: hotel.city,
        country: hotel.country,
        location: hotel.location,
        starRating: hotel.starRating,
        ownerId: randomOwner.id,
        logo: "/uploads/profile-1742622939806-575318330.jpeg",
        images: Array(Math.floor(Math.random() * 3) + 1).fill("/uploads/profile-1742622939806-575318330.jpeg")
      },
    });
    
    hotels.push(createdHotel);
    console.log(`Created hotel: ${createdHotel.name}`);
  }

  // Define room type templates
  const roomTypeTemplates = [
    {
      name: "Standard Room",
      description: "Comfortable room with all basic amenities",
      priceRange: [80, 150],
      amenities: ["WiFi", "Air Conditioning", "TV", "Private Bathroom"],
      totalRoomsRange: [15, 25]
    },
    {
      name: "Deluxe Room",
      description: "Spacious room with additional amenities and better views",
      priceRange: [150, 250],
      amenities: ["WiFi", "Air Conditioning", "Minibar", "TV", "Private Bathroom", "City View"],
      totalRoomsRange: [10, 20]
    },
    {
      name: "Executive Suite",
      description: "Luxurious suite with separate living area and premium amenities",
      priceRange: [250, 400],
      amenities: ["WiFi", "Air Conditioning", "Minibar", "Large TV", "Premium Bathroom", "Living Room", "Work Desk", "Room Service"],
      totalRoomsRange: [5, 15]
    },
    {
      name: "Family Room",
      description: "Spacious room designed for families with children",
      priceRange: [200, 350],
      amenities: ["WiFi", "Air Conditioning", "TV", "Extra Beds", "Family-sized Bathroom", "Child-friendly Amenities"],
      totalRoomsRange: [8, 15]
    },
    {
      name: "Ocean View Room",
      description: "Beautiful room with panoramic ocean views",
      priceRange: [180, 300],
      amenities: ["WiFi", "Air Conditioning", "Minibar", "Ocean View", "Balcony", "Premium Bedding"],
      totalRoomsRange: [10, 20]
    },
    {
      name: "Presidential Suite",
      description: "Our most luxurious accommodation with exclusive amenities",
      priceRange: [500, 1000],
      amenities: ["WiFi", "Air Conditioning", "Full Bar", "Multiple TVs", "Jacuzzi", "Private Terrace", "24/7 Butler Service", "VIP Treatment"],
      totalRoomsRange: [1, 5]
    },
    {
      name: "Penthouse",
      description: "Top floor luxury accommodation with the best views",
      priceRange: [600, 1200],
      amenities: ["WiFi", "Air Conditioning", "Full Kitchen", "Living Room", "Private Terrace", "Premium View", "VIP Service"],
      totalRoomsRange: [1, 3]
    }
  ];

  // Create room types for each hotel
  const roomTypes = [];
  for (const hotel of hotels) {
    // Each hotel gets 2-4 random room types
    const numRoomTypes = Math.floor(Math.random() * 3) + 2;
    const shuffledTemplates = [...roomTypeTemplates].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffledTemplates.slice(0, numRoomTypes);
    
    for (const template of selectedTemplates) {
      const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0])) + template.priceRange[0];
      const totalRooms = Math.floor(Math.random() * (template.totalRoomsRange[1] - template.totalRoomsRange[0])) + template.totalRoomsRange[0];
      
      // Add location-specific touches to room names for some hotels
      let roomName = template.name;
      if (hotel.city === "Paris" && Math.random() > 0.7) {
        roomName = roomName.replace("Room", "Parisienne");
      } else if (hotel.city === "New York" && Math.random() > 0.7) {
        roomName = roomName.replace("Room", "Manhattan Suite");
      } else if (hotel.city === "Tokyo" && Math.random() > 0.7) {
        roomName = roomName.replace("Room", "Tokyo Deluxe");
      }
      
      const roomType = await prisma.roomType.create({
        data: {
          name: roomName,
          description: template.description,
          pricePerNight: price,
          totalRooms: totalRooms,
          hotelId: hotel.id,
          amenities: template.amenities,
          images: Array(Math.floor(Math.random() * 2) + 1).fill("/uploads/profile-1742622939806-575318330.jpeg"),
        },
      });
      
      roomTypes.push(roomType);
    }
  }

  // Add room availability for the next 60 days for all room types
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const availabilityData = [];
    
    for (const roomType of roomTypes) {
      // Some rooms may have reduced availability on certain days
      const availability = Math.random() > 0.8 
        ? Math.floor(roomType.totalRooms * 0.7) // 70% availability on some days
        : roomType.totalRooms; // full availability normally
        
      availabilityData.push({
        roomTypeId: roomType.id,
        date: date,
        availableRooms: availability
      });
    }
    
    await prisma.roomAvailability.createMany({
      data: availabilityData
    });
  }

  // Create a decent number of bookings to populate the system
  const bookingStatuses = ["CONFIRMED", "PENDING", "CANCELLED"];
  const guestCounts = [1, 2, 2, 2, 3, 3, 4]; // More common to have 2-3 guests
  
  for (let i = 0; i < 20; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    const randomHotel = hotels.find(h => h.id === randomRoomType.hotelId);
    
    // Random stay length between 1-7 nights
    const stayLength = Math.floor(Math.random() * 7) + 1;
    
    // Random check-in date within the next 45 days
    const checkInOffset = Math.floor(Math.random() * 45) + 1;
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + checkInOffset);
    
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + stayLength);
    
    // Random guest count
    const guestCount = guestCounts[Math.floor(Math.random() * guestCounts.length)];
    
    // Calculate total price
    const totalPrice = randomRoomType.pricePerNight * stayLength;
    
    // Create flight search parameters based on locations
    let source, destination;
    if (i % 3 === 0) {
      source = "New York";
      destination = randomHotel.city;
    } else if (i % 3 === 1) {
      source = "Los Angeles";
      destination = randomHotel.city;
    } else {
      source = "Chicago";
      destination = randomHotel.city;
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: randomUser.id,
        totalPrice: totalPrice,
        status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
        flightSearchParams: JSON.stringify({
          source: source,
          destination: destination,
          passengers: guestCount
        })
      },
    });
    
    // Add room booking
    await prisma.roomBooking.create({
      data: {
        bookingId: booking.id,
        roomTypeId: randomRoomType.id,
        hotelId: randomHotel.id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guestCount: guestCount,
        totalPrice: totalPrice
      }
    });
    
    // Add a notification for most bookings
    if (Math.random() > 0.3) {
      await prisma.notification.create({
        data: {
          userId: randomUser.id,
          title: "Booking Confirmation",
          message: `Your booking for ${randomHotel.name} is confirmed`,
          isRead: Math.random() > 0.5,
          type: "BOOKING_CONFIRMATION",
          bookingId: booking.id
        }
      });
    }
  }

  console.log(`Database seeded successfully with ${hotels.length} hotels across ${new Set(hotelData.map(h => h.city)).size} cities!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });