import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/userMiddleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const authResponse = await authenticateUser(req);

    if (authResponse.status !== 200) {
        return authResponse;
    }

    const decodedEmail = authResponse.headers.get('x-user-email');
    
    if (!decodedEmail) {
        return NextResponse.json({ error: 'User email not found in token' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: decodedEmail },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const ownerId = user.id;

        // Fetch all hotels owned by the user
        const hotels = await prisma.hotel.findMany({
            where: {
                ownerId: ownerId
            },
            select: {
                id: true,
                name: true,
                location: true,
                starRating: true,
                images: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ hotels }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching owned hotels:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}