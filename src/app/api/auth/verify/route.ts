import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { ok: false, message: 'No token provided' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { ok: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get fresh user data from database
        const user = await getUserById(payload.id);
        
        if (!user) {
            return NextResponse.json(
                { ok: false, message: 'User not found' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            ok: true,
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
        console.error('Verify token API error:', error);
        return NextResponse.json(
            { ok: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
