import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateUser } from '@/lib/userMiddleware';
import path from 'path';
import { IncomingForm, Options, Fields, Files } from 'formidable';
import { IncomingMessage } from 'http';
import { writeFile } from 'fs/promises';

interface FormFields {
  newEmail?: string;
  phoneNumber?: string;
  password: string;
  newPassword?: string;
  prefersDarkMode?: string;
  [key: string]: string | undefined;
}

interface FormFiles {
  profilePicture?: {
    filepath: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ParsedForm {
  fields: FormFields;
  files: FormFiles;
}

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
  };
}

export const config = {
  api: {
    bodyParser: false, // IMPORTANT: disable built-in bodyParser
  },
};

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const authResponse = await authenticateUser(req);
  if (authResponse.status !== 200) return authResponse;

  const email = authResponse.headers.get('x-user-email');
  const role = authResponse.headers.get('x-user-role');
  const userId = authResponse.headers.get('x-user-id');
  if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const newEmail = formData.get('newEmail') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const newPassword = formData.get('newPassword') as string;
    const prefersDarkMode = formData.get('prefersDarkMode') as string;
    const profilePicture = formData.get('profilePicture') as File | null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    let hashedPassword = user.password;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile picture
    let profilePicturePath = user.profilePicture;
    if (profilePicture) {
      const bytes = await profilePicture.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const fileName = `${userId}-${Date.now()}-${profilePicture.name}`;
      const filePath = `./public/uploads/${fileName}`;
      
      await writeFile(filePath, buffer);
      profilePicturePath = `/uploads/${fileName}`;
    }

    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: {
        email: newEmail || user.email,
        phoneNumber: phoneNumber || user.phoneNumber,
        password: hashedPassword,
        profilePicture: profilePicturePath,
        prefersDarkMode: prefersDarkMode === 'true',
      },
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, user: safeUser }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}