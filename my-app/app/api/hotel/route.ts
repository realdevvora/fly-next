import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Ensure uploads directory exists
const ensureUploadDir = async () => {
    try {
        await mkdir(path.join(process.cwd(), 'public', 'uploads', 'hotels'), { recursive: true });
        return true;
    } catch (error) {
        console.error('Failed to create upload directory:', error);
        return false;
    }
};

// Process and save uploaded image
interface ProcessImageOptions {
    file: File;
    type: 'logo' | 'image';
    hotelId: string;
}

const processImage = async ({ file, type, hotelId }: ProcessImageOptions): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Generate filename
        const fileName = `${hotelId}-${type}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'hotels', fileName);
        
        // Resize based on type
        let processedBuffer: Buffer;
        if (type === 'logo') {
            processedBuffer = await sharp(buffer)
                .resize({ width: 400, height: 200, fit: 'inside' })
                .jpeg({ quality: 80 })
                .toBuffer();
        } else {
            processedBuffer = await sharp(buffer)
                .resize({ width: 1200, height: 800, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
        }
        
        // Save file
        await writeFile(filePath, processedBuffer);
        
        // Return public URL
        return `/uploads/hotels/${fileName}`;
    } catch (error) {
        console.error(`Error processing ${type} image:`, error);
        throw error;
    }
};

export async function POST(req: NextRequest) {
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
        return authResponse;
    }

    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        // Ensure uploads directory exists
        await ensureUploadDir();
        
        // Check if the request is multipart form data
        const contentType = req.headers.get('content-type') || '';
        let hotelData: any = {};
        let imageUrls: string[] = [];
        let logoUrl: string | null = null;
        
        // Handle form data submission
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            
            // Extract form fields
            hotelData = {
                name: formData.get('name') as string,
                address: formData.get('address') as string,
                city: formData.get('city') as string,
                country: formData.get('country') as string,
                location: formData.get('location') as string,
                starRating: parseInt(formData.get('starRating') as string, 10)
            };
            
            // Temporarily generate an ID for the files
            const tempHotelId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            
            // Process logo if present
            const logoFile = formData.get('logo') as File;
            if (logoFile && logoFile instanceof File && logoFile.size > 0) {
                logoUrl = await processImage({ file: logoFile, type: 'logo', hotelId: tempHotelId });
            }
            
            const images = formData.getAll('images');
            if (images && images.length > 0) {
                const imagePromises = [];
                for (const image of images) {
                    if (image instanceof File && image.size > 0) {
                        imagePromises.push(processImage({ file: image, type: 'image', hotelId: tempHotelId }));
                    }
                }
                
                // Wait for all images to process
                try {
                    imageUrls = await Promise.all(imagePromises);
                } catch (error) {
                    console.error('Error processing one or more images:', error);
                    return NextResponse.json(
                        { error: 'Failed to process uploaded images' },
                        { status: 500 }
                    );
                }
            }

        } else {
            // Handle JSON submission for backward compatibility
            let body;
            try {
                body = await req.json();
            } catch (error) {
                return NextResponse.json(
                    { error: 'Malformed JSON body' },
                    { status: 400 }
                );
            }
            
            hotelData = {
                name: body.name,
                logo: body.logo,
                address: body.address,
                city: body.city,
                country: body.country,
                location: body.location,
                starRating: body.starRating
            };
            
            logoUrl = body.logo;
            imageUrls = body.images || [];
        }
        
        // Validation checks similar to original
        const { name, address, city, country, location, starRating } = hotelData;
        const ownerId = user.id;
        
        const requiredFields = {
            name,
            address,
            city,
            country,
            location,
            starRating,
            ownerId
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (imageUrls.length === 0) {
            missingFields.push("images (at least one image is required)");
        }

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            );
        }

        // Additional validations as in original code
        if (typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'name is required as string' }, { status: 400 });
        }

        if (typeof starRating !== 'number' || isNaN(starRating) || starRating < 1 || starRating > 5) {
            return NextResponse.json({ error: 'Invalid star rating. It must be between 1 and 5' }, { status: 400 });
        }

        if (typeof address !== 'string' || address.trim() === '') {
            return NextResponse.json({ error: 'Address is required as string' }, { status: 400 });
        }

        if (typeof city !== 'string' || city.trim() === '') {
            return NextResponse.json({ error: 'City is required as string' }, { status: 400 });
        }

        if (typeof country !== 'string' || country.trim() === '') {
            return NextResponse.json({ error: 'Country is required as string' }, { status: 400 });
        }

        if (typeof location !== 'string' || location.trim() === '') {
            return NextResponse.json({ error: 'Location is required as string' }, { status: 400 });
        }

        // Create hotel in database
        const hotel = await prisma.hotel.create({
            data: {
                name,
                logo: logoUrl,
                address,
                city,
                country,
                location,
                starRating,
                ownerId,
                images: imageUrls
            },
        });

        return NextResponse.json({ hotel }, { status: 201 });
    } catch (error) {
        console.error("Error creating hotel:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
        return authResponse;
    }

    const email = authResponse.headers.get('x-user-email');
    if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        // Ensure uploads directory exists
        await ensureUploadDir();
        
        const contentType = req.headers.get('content-type') || '';
        let hotelId: string;
        let updateData: any = {};
        
        // Handle multipart form data
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            
            // Get hotel ID
            hotelId = formData.get('hotelId') as string;
            if (!hotelId) {
                return NextResponse.json({ error: 'hotelId is required' }, { status: 400 });
            }
            
            // Find hotel
            const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
            if (!hotel) {
                return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
            }
            
            // Verify ownership
            if (hotel.ownerId !== user.id) {
                return NextResponse.json({ error: 'Unauthorized to update this hotel' }, { status: 403 });
            }
            
            // Process text fields
            const name = formData.get('name') as string;
            if (name) updateData.name = name;
            
            const address = formData.get('address') as string;
            if (address) updateData.address = address;
            
            const city = formData.get('city') as string;
            if (city) updateData.city = city;
            
            const country = formData.get('country') as string;
            if (country) updateData.country = country;
            
            const location = formData.get('location') as string;
            if (location) updateData.location = location;
            
            const starRatingStr = formData.get('starRating') as string;
            if (starRatingStr) {
                const starRating = parseInt(starRatingStr, 10);
                if (isNaN(starRating) || starRating < 1 || starRating > 5) {
                    return NextResponse.json({ error: 'Invalid star rating. It must be between 1 and 5' }, { status: 400 });
                }
                updateData.starRating = starRating;
            }
            
            // Process logo
            const logoFile = formData.get('logo') as File;
            if (logoFile && logoFile instanceof File && logoFile.size > 0) {
                const logoUrl = await processImage({ file: logoFile, type: 'logo', hotelId });
                updateData.logo = logoUrl;
            }
            
            // Handle new images to add
            const newImages = formData.getAll('newImages');
            let updatedImages = [...hotel.images];
            
            if (newImages && newImages.length > 0) {
                for (const image of newImages) {
                    if (image instanceof File && image.size > 0) {
                        const imageUrl = await processImage({ file: image, type: 'image', hotelId });
                        updatedImages.push(imageUrl);
                    }
                }
            }
            
            // Handle images to remove
            const removeImagesStr = formData.get('removeImages') as string;
            if (removeImagesStr) {
                try {
                    const removeImages = JSON.parse(removeImagesStr);
                    if (Array.isArray(removeImages) && removeImages.length > 0) {
                        // Here you would delete the images from storage
                        // For now, we'll just filter them out from the array
                        updatedImages = updatedImages.filter(img => !removeImages.includes(img));
                    }
                } catch (e) {
                    console.error('Error parsing removeImages JSON:', e);
                }
            }
            
            // Update images array if changed
            if (updatedImages.length > 0 || newImages.length > 0 || removeImagesStr) {
                updateData.images = updatedImages;
            }
        } else {
            // Handle JSON request (original implementation)
            let body;
            try {
                body = await req.json();
            } catch (error) {
                return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
            }

            hotelId = body.hotelId;
            if (!hotelId) {
                return NextResponse.json({ error: 'hotelId is required' }, { status: 400 });
            }

            const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
            if (!hotel) {
                return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
            }

            if (hotel.ownerId !== user.id) {
                return NextResponse.json({ error: 'Unauthorized to update this hotel' }, { status: 403 });
            }

            const { name, logo, address, city, country, location, starRating, images, addImages, removeImages } = body;
            
            if (name !== undefined) updateData.name = name;
            if (logo !== undefined) updateData.logo = logo;
            if (address !== undefined) updateData.address = address;
            if (city !== undefined) updateData.city = city;
            if (country !== undefined) updateData.country = country;
            if (location !== undefined) updateData.location = location;
            if (starRating !== undefined) {
                if (typeof starRating !== 'number' || starRating < 1 || starRating > 5) {
                    return NextResponse.json({ error: 'Invalid star rating. It must be between 1 and 5' }, { status: 400 });
                }
                updateData.starRating = starRating;
            }
            
            if (images !== undefined) {
                if (!Array.isArray(images) || images.length === 0) {
                    return NextResponse.json({ error: 'Images must be a non-empty array' }, { status: 400 });
                }
                updateData.images = images;
            }

            if (addImages || removeImages) {
                let updatedImages = hotel.images;
                if (addImages && Array.isArray(addImages)) {
                    updatedImages = [...new Set([...updatedImages, ...addImages])];
                }
                if (removeImages && Array.isArray(removeImages)) {
                    updatedImages = updatedImages.filter((img : any) => !removeImages.includes(img));
                }
                updateData.images = updatedImages;
            }
        }

        const updatedHotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: updateData,
        });

        return NextResponse.json({ hotel: updatedHotel }, { status: 200 });
    } catch (error) {
        console.error('Error updating hotel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Keep the existing GET method as is
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const params = new URLSearchParams(url.search);

        const startDate = params.get('startDate');
        const endDate = params.get('endDate');
        const city = params.get('city');
        const name = params.get('name');
        const starRating = params.get('starRating');
        const minPrice = params.get('minPrice');
        const maxPrice = params.get('maxPrice');

        if (!city || !startDate || !endDate) {
            return NextResponse.json({ error: 'City, start date, and end date required' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Ensure startDate <= endDate
        if (start > end) {
            return NextResponse.json(
                { error: "startDate cannot be after endDate" },
                { status: 400 }
            );
        }

        if (typeof city !== 'string' || city.trim() === '') {
            return NextResponse.json({ error: 'City is required as string' }, { status: 400 });
        }

        if (name && (typeof name !== 'string' || name.trim() === '')) {
            return NextResponse.json({ error: 'name is required as string' }, { status: 400 });
        }

        if (minPrice && (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice))) {
            return NextResponse.json(
                { error: "minPrice cannot be greater than maxPrice and both must be numbers" },
                { status: 400 }
            );
        }

        if (starRating && (Number(starRating) < 1 || Number(starRating) > 5)) {
            return NextResponse.json({ error: 'Invalid star rating. It must be a number between 1 and 5' }, { status: 400 });
        }

        // Create the base filter structure
        const whereClause: any = {
            roomTypes: {
                some: {
                    AND: [
                        {
                            totalRooms: { gt: 0 }
                        },
                        {
                            roomBookings: {
                                none: {
                                    AND: [
                                        { checkInDate: { lt: new Date(endDate) } },
                                        { checkOutDate: { gt: new Date(startDate) } }
                                    ]
                                }
                            }
                        },
                        ...(minPrice ? [{ pricePerNight: { gte: parseFloat(minPrice) } }] : []),
                        ...(maxPrice ? [{ pricePerNight: { lte: parseFloat(maxPrice) } }] : [])
                    ]
                }
            }
        };
        
        // Add case-insensitive city search
        whereClause.city = {
            contains: city,
            mode: 'insensitive'
        };
        
        // Add case-insensitive name search if provided
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive'
            };
        }
        
        // Add star rating if provided
        if (starRating) {
            whereClause.starRating = parseInt(starRating, 10);
        }

        const filters = {
            where: whereClause,
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                country: true,
                location: true,
                starRating: true,
                images: true,
                roomTypes: {
                    select: {
                        id: true,
                        name: true,
                        pricePerNight: true,
                        totalRooms: true,
                        amenities: true,
                        images: true,
                        roomBookings: {
                            where: {
                                AND: [
                                    { checkInDate: { lt: new Date(endDate) } },
                                    { checkOutDate: { gt: new Date(startDate) } }
                                ]
                            },
                            select: {
                                checkInDate: true,
                                checkOutDate: true
                            }
                        }
                    }
                }
            }
        };

        const hotels = await prisma.hotel.findMany(filters);
        const filteredHotels = hotels.map((hotel : any) => ({
            ...hotel,
            roomTypes: hotel.roomTypes.filter((roomType : any) =>
                roomType.totalRooms > roomType.roomBookings.length
            )
        })).filter((hotel: any) => hotel.roomTypes.length > 0);

        return NextResponse.json({ hotels: filteredHotels }, { status: 200 });

    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}