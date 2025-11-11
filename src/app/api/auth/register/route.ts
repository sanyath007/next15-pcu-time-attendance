import { NextRequest, NextResponse } from 'next/server';
import { registerUser, RegisterData } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password, name, role } = body as RegisterData;

        if (!username || !email || !password || !name) {
            return NextResponse.json(
                { ok: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Basic password validation
        if (password.length < 6) {
            return NextResponse.json(
                { ok: false, message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { ok: false, message: 'Invalid email format' },
                { status: 400 }
            );
        }

        const { user, token, error } = await registerUser({
            username,
            email,
            password,
            name,
            role
        });

        if (!user || !token) {
            return NextResponse.json(
                { ok: false, message: error || 'Registration failed' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: 'Registration successful',
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
        console.error('Register API error:', error);
        return NextResponse.json(
            { ok: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
