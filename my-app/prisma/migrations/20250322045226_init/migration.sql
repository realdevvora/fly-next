-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'BOOKING_UPDATE', 'HOTEL_NEW_BOOKING', 'PAYMENT_CONFIRMATION', 'CHECK_IN_REMINDER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('User');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'User',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePicture" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prefersDarkMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightBookingReference" (
    "id" TEXT NOT NULL,
    "afsBookingId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "passengerCount" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "isRoundTrip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightBookingReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "images" TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "totalRooms" INTEGER NOT NULL,
    "hotelId" TEXT NOT NULL,
    "amenities" TEXT[],
    "images" TEXT[],

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAvailability" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "availableRooms" INTEGER NOT NULL,

    CONSTRAINT "RoomAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flightSearchParams" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "hotelId" TEXT NOT NULL,

    CONSTRAINT "RoomBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentFlightSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceCity" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentFlightSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "NotificationType" NOT NULL,
    "bookingId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInfo" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "cardholderName" TEXT NOT NULL,
    "lastFourDigits" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FlightBookingReference_afsBookingId_key" ON "FlightBookingReference"("afsBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomAvailability_roomTypeId_date_key" ON "RoomAvailability"("roomTypeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInfo_bookingId_key" ON "PaymentInfo"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_code_key" ON "Airport"("code");

-- AddForeignKey
ALTER TABLE "FlightBookingReference" ADD CONSTRAINT "FlightBookingReference_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAvailability" ADD CONSTRAINT "RoomAvailability_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBooking" ADD CONSTRAINT "RoomBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBooking" ADD CONSTRAINT "RoomBooking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomBooking" ADD CONSTRAINT "RoomBooking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInfo" ADD CONSTRAINT "PaymentInfo_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Airport" ADD CONSTRAINT "Airport_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
