import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const secret = process.env.JWT_SECRET;

export async function authenticateUser(request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        
        if (!refreshToken) {
            return NextResponse.json({ error: 'Unauthorized: Not logged in' }, { status: 401 });
        }

        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, secret);
            
            // Generate new access token
            const accessToken = jwt.sign(
                { userId: decoded.userId, email: decoded.email, role: decoded.role },
                secret,
                { expiresIn: '15m' }
            );

            // Create response and add user data to headers
            const response = NextResponse.next();
            response.headers.set('Authorization', `Bearer ${accessToken}`);
            response.headers.set('x-user-id', decoded.userId);
            response.headers.set('x-user-email', decoded.email);
            response.headers.set('x-user-role', decoded.role);

            return response;

        } catch (error) {
            // Clear invalid refresh token
            cookieStore.set('refreshToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 0
            });
            return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}