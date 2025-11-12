import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import moment from 'moment';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log(body);

        const {
            prefix,
            firstname,
            lastname,
            sex,
            birthdate,
            cid,
            email,
            position_id,
            position_level,
            face_descriptor,
            profile_image
        } = body;

        /** TODO: Save employee face descriptor to database */
        const employee = await db.employee.create({
            data: {
                prefix,
                firstname,
                lastname,
                sex: parseInt(sex),
                birthdate: birthdate ? moment(`${birthdate} 08:30:00`).toDate() : moment().toDate(),
                cid,
                email,
                position_id: parseInt(position_id),
                position_level,
                face_descriptor,
                profile_image
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Employee registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, message: 'Registration failed' },
            { status: 500 }
        );
    }
}