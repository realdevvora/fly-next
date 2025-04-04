// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ isLoggedIn: false }, { status: 200 });
  }

  try {
    const decoded = jwt.verify(refreshToken, secret);
    return NextResponse.json({ isLoggedIn: true, user: decoded }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ isLoggedIn: false }, { status: 200 });
  }
}
