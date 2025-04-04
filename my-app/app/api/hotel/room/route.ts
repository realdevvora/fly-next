import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Ensure uploads directory exists
const ensureUploadDir = async () => {
    try {
        await mkdir(path.join(process.cwd(), 'public', 'uploads', 'rooms'), { recursive: true });
        return true;
    } catch (error) {
        console.error('Failed to create upload directory:', error);
        return false;
    }
};

// Process and save uploaded image
interface ProcessImageFile extends File {
    arrayBuffer: () => Promise<ArrayBuffer>;
}

const processImage = async (file: ProcessImageFile, hotelId: string): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Generate filename
        const fileName = `${hotelId}-room-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'rooms', fileName);
        
        // Resize and optimize the image
        const processedBuffer = await sharp(buffer)
            .resize({ width: 1200, height: 800, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        
        // Save file
        await writeFile(filePath, processedBuffer);
        
        // Return public URL
        return `/uploads/rooms/${fileName}`;
    } catch (error) {
        console.error('Error processing image:', error);
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

    const ownerId = user?.id;

    try {
        // Check if the request is multipart form data
        const contentType = req.headers.get('content-type') || '';
        let roomTypeData: any = {};
        let imageUrls: string[] = [];
        
        if (contentType.includes('multipart/form-data')) {
            // Ensure uploads directory exists
            await ensureUploadDir();
            
            const formData = await req.formData();
            
            // Extract form fields
            roomTypeData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                hotelId: formData.get('hotelId') as string,
                pricePerNight: parseFloat(formData.get('pricePerNight') as string),
                totalRooms: parseInt(formData.get('totalRooms') as string, 10)
            };
            
            // Parse amenities from JSON string
            const amenitiesStr = formData.get('amenities') as string;
            if (amenitiesStr) {
                try {
                    roomTypeData.amenities = JSON.parse(amenitiesStr);
                } catch (e) {
                    return NextResponse.json({ error: 'Invalid amenities format' }, { status: 400 });
                }
            }
            
            // Process images
            const images = formData.getAll('images');
            if (images && images.length > 0) {
                try {
                    const imagePromises = [];
                    for (const image of images) {
                        if (image instanceof File && image.size > 0) {
                            imagePromises.push(processImage(image, roomTypeData.hotelId));
                        }
                    }
                    imageUrls = await Promise.all(imagePromises);
                } catch (error) {
                    console.error('Error processing images:', error);
                    return NextResponse.json(
                        { error: 'Failed to process uploaded images' },
                        { status: 500 }
                    );
                }
            }
            
            roomTypeData.images = imageUrls;
        } else {
            // Handle JSON request
            let body;
            try {
                body = await req.json();
            } catch (error) {
                return NextResponse.json(
                    { error: 'Malformed JSON body' },
                    { status: 400 }
                );
            }

            const {
                name,
                description,
                hotelId,
                amenities,
                pricePerNight,
                images,
                totalRooms
            } = body;
            
            roomTypeData = {
                name,
                description,
                hotelId,
                amenities,
                pricePerNight,
                totalRooms
            };
            
            imageUrls = images || [];
        }
        
        // Validation
        const {
            name,
            description,
            hotelId,
            amenities,
            pricePerNight,
            totalRooms
        } = roomTypeData;

        const requiredFields = {
            name,
            description,
            hotelId,
            amenities,
            pricePerNight,
            ownerId,
            totalRooms
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

        if (typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing name" },
                { status: 400 }
            );
        }

        if (typeof description !== 'string' || description.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing description" },
                { status: 400 }
            );
        }

        if (typeof hotelId !== 'string' || hotelId.trim() === '') {
            return NextResponse.json(
                { error: "Invalid or missing hotelId" },
                { status: 400 }
            );
        }

        if (!Array.isArray(amenities) || amenities.length === 0) {
            return NextResponse.json(
                { error: "Invalid amenities. Must be a non-empty array" },
                { status: 400 }
            );
        }

        if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
            return NextResponse.json(
                { error: "Invalid pricePerNight. Must be a positive number" },
                { status: 400 }
            );
        }

        if (typeof totalRooms !== 'number' || totalRooms <= 0) {
            return NextResponse.json(
                { error: "Invalid totalRooms. Must be a positive number" },
                { status: 400 }
            );
        }

        const ownerUser = user;

        const hotel = await prisma.hotel.findUnique({
            where: {
                id: hotelId,
            },
        });

        if (!hotel) {
            return NextResponse.json(
                { error: `Hotel with id ${hotelId} not found` },
                { status: 404 }
            );
        }

        if (ownerUser?.id !== hotel.ownerId) {
            return NextResponse.json(
                { error: `User does not have permission to interact with this hotel's room types` },
                { status: 400 }
            );
        }

        const existingRoomType = await prisma.roomType.findFirst({
            where: {
                hotelId,
                name,
            },
        });

        if (existingRoomType) {
            return NextResponse.json(
                { error: "A room type with this name already exists in the hotel." },
                { status: 400 }
            );
        }

        const roomType = await prisma.roomType.create({
            data: {
                name,
                description,
                hotelId,
                pricePerNight,
                totalRooms,
                amenities: amenities as string[],
                images: imageUrls
            }
        });

        return NextResponse.json({ roomType }, { status: 201 });

    } catch (error) {
        console.error("Error creating roomType:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
        return authResponse;
    }
    
    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Check if the request is multipart form data
        const contentType = req.headers.get('content-type') || '';
        let roomTypeId: string | undefined;
        let updateData: any = {};
        let newImageUrls: string[] = [];
        
        if (contentType.includes('multipart/form-data')) {
            // Ensure uploads directory exists
            await ensureUploadDir();
            
            const formData = await req.formData();
            
            // Get roomTypeId
            roomTypeId = formData.get('roomTypeId') as string;
            if (!roomTypeId) {
                return NextResponse.json({ error: 'roomTypeId is required' }, { status: 400 });
            }
            
            // Find the room type
            if (!roomTypeId) {
                return NextResponse.json({ error: 'roomTypeId is required' }, { status: 400 });
            }

            const roomType = await prisma.roomType.findUnique({
                where: { id: roomTypeId },
                include: { hotel: true },
            });
            
            if (!roomType) {
                return NextResponse.json({ error: `Room type with id ${roomTypeId} not found` }, { status: 404 });
            }
            
            // Check user permissions
            const user = await prisma.user.findUnique({
                where: { email: email },
            });
            
            if (!user || user.id !== roomType.hotel.ownerId) {
                return NextResponse.json({ error: 'User does not have permission to update this room type' }, { status: 403 });
            }
            
            // Process form fields
            const name = formData.get('name') as string;
            if (name) updateData.name = name;
            
            const description = formData.get('description') as string;
            if (description) updateData.description = description;
            
            const pricePerNightStr = formData.get('pricePerNight') as string;
            if (pricePerNightStr) {
                const pricePerNight = parseFloat(pricePerNightStr);
                if (isNaN(pricePerNight) || pricePerNight <= 0) {
                    return NextResponse.json({ error: 'Invalid price per night value' }, { status: 400 });
                }
                updateData.pricePerNight = pricePerNight;
            }
            
            const totalRoomsStr = formData.get('totalRooms') as string;
            if (totalRoomsStr) {
                const totalRooms = parseInt(totalRoomsStr, 10);
                if (isNaN(totalRooms) || totalRooms <= 0) {
                    return NextResponse.json({ error: 'Invalid total rooms value' }, { status: 400 });
                }
                updateData.totalRooms = totalRooms;
            }
            
            // Process amenities
            const amenitiesStr = formData.get('amenities') as string;
            if (amenitiesStr) {
                try {
                    const amenities = JSON.parse(amenitiesStr);
                    if (Array.isArray(amenities) && amenities.length > 0) {
                        updateData.amenities = amenities;
                    } else {
                        return NextResponse.json({ error: 'Amenities must be a non-empty array' }, { status: 400 });
                    }
                } catch (e) {
                    return NextResponse.json({ error: 'Invalid amenities format' }, { status: 400 });
                }
            }
            
            // Process new images
            const newImages = formData.getAll('newImages');
            if (newImages && newImages.length > 0) {
                try {
                    const imagePromises = [];
                    for (const image of newImages) {
                        if (image instanceof File && image.size > 0) {
                            imagePromises.push(processImage(image, roomType.hotelId));
                        }
                    }
                    // Process all images in parallel and get results
                    newImageUrls = await Promise.all(imagePromises);
                } catch (error) {
                    console.error('Error processing new images:', error);
                    return NextResponse.json(
                        { error: 'Failed to process uploaded images' },
                        { status: 500 }
                    );
                }
            }
            
            // Handle existing and new images
            if (newImageUrls.length > 0 || formData.has('removeImages')) {
                const removeImagesStr = formData.get('removeImages') as string;
                let existingImages = [...roomType.images];
                
                // Remove images if specified
                if (removeImagesStr) {
                    try {
                        const removeImages = JSON.parse(removeImagesStr);
                        if (Array.isArray(removeImages)) {
                            existingImages = existingImages.filter(img => !removeImages.includes(img));
                        }
                    } catch (e) {
                        console.error('Error parsing removeImages JSON:', e);
                    }
                }
                
                // Combine existing and new images
                updateData.images = [...existingImages, ...newImageUrls];
            }
        } else {
            // Handle JSON request
            let body;
            try {
                body = await req.json();
            } catch (error) {
                return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
            }

            const { roomTypeId, name, description, pricePerNight, totalRooms, amenities, images, addImages, removeImages } = body;

            if (!roomTypeId) {
                return NextResponse.json({ error: 'Missing roomTypeId' }, { status: 400 });
            }

            const roomType = await prisma.roomType.findUnique({
                where: { id: roomTypeId },
                include: { hotel: true },
            });

            if (!roomType) {
                return NextResponse.json({ error: `Room type with id ${roomTypeId} not found` }, { status: 404 });
            }

            const user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (!user || user.id !== roomType.hotel.ownerId) {
                return NextResponse.json({ error: 'User does not have permission to update this room type' }, { status: 403 });
            }

            // Build update data
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (pricePerNight !== undefined) {
                if (typeof pricePerNight !== 'number' || pricePerNight <= 0) {
                    return NextResponse.json({ error: 'Invalid pricePerNight. Must be a positive number' }, { status: 400 });
                }
                updateData.pricePerNight = pricePerNight;
            }
            if (totalRooms !== undefined) {
                if (typeof totalRooms !== 'number' || totalRooms <= 0) {
                    return NextResponse.json({ error: 'Invalid totalRooms. Must be a positive number' }, { status: 400 });
                }
                updateData.totalRooms = totalRooms;
            }
            if (amenities !== undefined) {
                if (!Array.isArray(amenities) || amenities.length === 0) {
                    return NextResponse.json({ error: 'Amenities must be a non-empty array' }, { status: 400 });
                }
                updateData.amenities = amenities;
            }
            
            // Handle image updates
            if (images !== undefined) {
                if (!Array.isArray(images) || images.length === 0) {
                    return NextResponse.json({ error: 'Images must be a non-empty array' }, { status: 400 });
                }
                updateData.images = images;
            } else if (addImages || removeImages) {
                let updatedImages = [...roomType.images];
                
                if (addImages && Array.isArray(addImages)) {
                    updatedImages = [...updatedImages, ...addImages];
                }
                
                if (removeImages && Array.isArray(removeImages)) {
                    updatedImages = updatedImages.filter(img => !removeImages.includes(img));
                }
                
                if (updatedImages.length === 0) {
                    return NextResponse.json({ error: 'Room type must have at least one image' }, { status: 400 });
                }
                
                updateData.images = updatedImages;
            }
        }

        // Perform the update
        const updatedRoomType = await prisma.roomType.update({
            where: { id: roomTypeId },
            data: updateData,
        });

        return NextResponse.json({ roomType: updatedRoomType }, { status: 200 });
    } catch (error) {
        console.error('Error updating roomType:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}