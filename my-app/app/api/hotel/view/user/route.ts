import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Fetch all hotels that are publicly available
        const hotels = await prisma.hotel.findMany({
            include: {
                roomTypes: {
                    select: {
                        id: true,
                        name: true,
                        pricePerNight: true,
                        totalRooms: true,
                        images: true,
                        _count: {
                            select: {
                                roomBookings: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        bookings: true
                    }
                }
            },
            // You might want to add a filter for active/published hotels
            // where: { status: 'published' },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!hotels || hotels.length === 0) {
            return NextResponse.json({ 
                message: "No hotels found",
                hotels: [] 
            }, { status: 200 });
        }

        // Process hotels data to include summary information
        interface RoomType {
            id: string;
            name: string;
            pricePerNight: number;
            totalRooms: number;
            images: string[];
            _count: {
                roomBookings: number;
            };
        }

        interface Hotel {
            id: string;
            name: string;
            address: string;
            city: string;
            country: string;
            location: string | null;
            starRating: number | null;
            images: string[];
            logo: string | null;
            createdAt: Date;
            updatedAt: Date;
            roomTypes: RoomType[];
            _count: {
                bookings: number;
            };
        }

        interface ProcessedRoomType {
            id: string;
            name: string;
            pricePerNight: number;
            totalRooms: number;
            images: string[];
            bookingsCount: number;
        }

        interface ProcessedHotel {
            id: string;
            name: string;
            address: string;
            city: string;
            country: string;
            location: string | null;
            starRating: number | null;
            images: string[];
            logo: string | null;
            createdAt: Date;
            updatedAt: Date;
            totalRooms: number;
            totalBookings: number;
            roomTypesCount: number;
            roomTypes: ProcessedRoomType[];
        }

        const processedHotels: ProcessedHotel[] = hotels.map((hotel: Hotel) => {
            // Calculate total rooms across all room types
            const totalRooms = hotel.roomTypes.reduce((sum, roomType) => sum + roomType.totalRooms, 0);
            
            // Calculate total bookings across all room types
            const totalBookings = hotel._count.bookings;
            
            return {
                id: hotel.id,
                name: hotel.name,
                address: hotel.address,
                city: hotel.city,
                country: hotel.country,
                location: hotel.location,
                starRating: hotel.starRating,
                images: hotel.images,
                logo: hotel.logo,
                createdAt: hotel.createdAt,
                updatedAt: hotel.updatedAt,
                totalRooms: totalRooms,
                totalBookings: totalBookings,
                roomTypesCount: hotel.roomTypes.length,
                roomTypes: hotel.roomTypes.map((rt: RoomType) => ({
                    id: rt.id,
                    name: rt.name,
                    pricePerNight: rt.pricePerNight,
                    totalRooms: rt.totalRooms,
                    images: rt.images,
                    bookingsCount: rt._count.roomBookings
                }))
            };
        });

        return NextResponse.json({
            message: "Hotels retrieved successfully",
            hotels: processedHotels
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json(
            { error: "Error fetching hotels" },
            { status: 500 }
        );
    }
}