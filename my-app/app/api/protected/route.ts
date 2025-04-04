import { authenticateUser } from '@/lib/userMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const authResponse = await authenticateUser(req);
    if (authResponse.status !== 200) {
        return authResponse; // Deny access if authentication fails
    }
    const email = authResponse.headers.get('x-user-email');
    const role = authResponse.headers.get('x-user-role');
    const userId = authResponse.headers.get('x-user-id');
    if (!email || !role || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Protected content
    return NextResponse.json({ message: "Protected content accessed!" }, { status: 200 });
}
