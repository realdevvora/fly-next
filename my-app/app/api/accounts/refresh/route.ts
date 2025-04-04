import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = process.env.JWT_SECRET as string;

interface TokenPayload {
  email: string;  // Changed from username to email to match your implementation
  role: string;
  [key: string]: any;
}

// Support both GET and POST methods
export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}

async function handleRefresh(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = (await cookieStore).get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 401 }
      );
    }
    
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(refreshToken, secret) as TokenPayload;
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const newAccessToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      secret,
      { expiresIn: '30m' }
    );
    
    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      secret,
      { expiresIn: '7d' }
    );
    
    // Create response and set cookies properly
    const response = NextResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    );
    
    // Set the cookies on the response object
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
    
    return response;
  } catch (error) {
    console.error("Internal Server Error:", (error as Error).message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}