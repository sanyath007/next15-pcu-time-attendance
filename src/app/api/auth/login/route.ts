import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, registerUser, LoginCredentials, RegisterData } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body as LoginCredentials;

        if (!username || !password) {
            return NextResponse.json(
                { ok: false, message: 'Username and password are required' },
                { status: 400 }
            );
        }

        const { user, token } = await authenticateUser({ username, password });

        if (!user || !token) {
            return NextResponse.json(
                { ok: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        (await cookies()).set("auth_token", token, { httpOnly: true, secure: true });

        return NextResponse.json({
            ok: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                departmentId: user.departmentId,
                subdeptid: user.subdeptid,
                lineUserId: user.lineUserId,
                lineDisplayName: user.lineDisplayName,
                linePictureUrl: user.linePictureUrl,
            }
        });
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { ok: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
