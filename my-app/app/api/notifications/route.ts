import { authenticateUser } from '@/lib/userMiddleware';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
    try {
      // Authenticate the user
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
      })
      
      // Check if user exists
      if (!user) {
        return NextResponse.json({ message: 'Forbidden: User not found' }, { status: 403 })
      }
      console.log(user)
      
      // parse body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: 'Malformed input: Unable to parse JSON' },
        { status: 400 }
      );
    }
      const { notificationIds } = body;
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { message: 'Invalid request: notificationIds array is required' },
          { status: 400 }
        );
      }
      
      // fetch notifications
      const notifications = await prisma.notification.findMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
      });
      
      // Create a set of valid notification IDs that belong to the user
      const validIds = notifications.map(n => n.id);
      
      // Check if all requested notification IDs belong to the user
      if (validIds.length !== notificationIds.length) {
        return NextResponse.json(
          { message: 'Forbidden: Some notifications do not belong to the user' },
          { status: 403 }
        );
      }
      
      // mark as read
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: validIds },
          userId: user.id, // Added additional check for user ID
        },
        data: {
          isRead: true,
        },
      });
      
      return NextResponse.json({
        message: `Marked ${result.count} notifications as read`,
        updatedCount: result.count,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  

export async function GET(req: NextRequest) {
    try {
        // Authenticate the user
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
        })
        // Check if user exists
        if (!user) {
            return NextResponse.json({ message: 'Forbidden: User not found' }, { status: 403 })
        }

        // Fetch unread notifications for the user
        const notifications = await prisma.notification.findMany({
            where: {
                userId: user?.id,
                isRead: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
