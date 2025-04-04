import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

// For Next.js App Router, config should be defined like this:
export async function POST(req: Request) {
  try {
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('Form data parsing error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Extract fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const profilePicture = formData.get('profilePicture');

    // Validation checks
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already taken, please log in using this email' },
        { status: 400 }
      );
    }

    // Handle file upload
    let profilePicturePath = '';
    
    if (profilePicture) {
      let buffer;
      let filename;
      
      // Check if it's a File object or not
      if (typeof profilePicture === 'object' && 'arrayBuffer' in profilePicture) {
        // It's a File object
        const bytes = await (profilePicture as File).arrayBuffer();
        buffer = Buffer.from(bytes);
        
        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = (profilePicture as File).name.split('.').pop() || 'jpg';
        filename = `profile-${uniqueSuffix}.${extension}`;
      } else {
        // Handle if it's somehow a string or other type
        console.error('Profile picture is not a File object:', typeof profilePicture);
        return NextResponse.json(
          { success: false, message: 'Invalid profile picture format' },
          { status: 400 }
        );
      }
      
      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }
      
      // Save file
      await writeFile(path.join(uploadDir, filename), buffer);
      profilePicturePath = `/uploads/${filename}`;
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        profilePicture: profilePicturePath,
        prefersDarkMode: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json(
      { success: true, message: 'User registered successfully', user: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while registering the user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}