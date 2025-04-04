import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET as string;

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !bcrypt.compareSync(body.password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const cookieStore = await cookies();
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '75m' } // shorter expiry for access token
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Return access token to store in memory
    return NextResponse.json({
      accessToken,
      user: {
        email: user.email,
        role: user.role
      },
      message: 'Login successful',
      redirect: '/'
    });

  } catch (error) {
    console.error("Login Error:", (error as Error).message);
    return NextResponse.json(
      { error: 'Invalid credentials or server error' },
      { status: 401 }
    );
  }
}