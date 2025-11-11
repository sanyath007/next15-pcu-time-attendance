import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as faceapi from 'face-api.js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { descriptor, image } = body;

        // TODO: Compare descriptor with stored employee face descriptors
        const employees = await db.employee.findMany({
            select: { id: true, firstname: true, lastname: true, face_descriptor: true }
        });

        // Find the best match using Euclidean distance
        const matches = employees.map(employee => ({
            ...employee,
            distance: faceapi.euclideanDistance(descriptor, employee.face_descriptor)
        }));

        const bestMatch = matches.reduce((min, curr) => curr.distance < min.distance ? curr : min);

        const threshold = 0.6; // Adjust based on your needs
        if (bestMatch.distance < threshold) {
            return NextResponse.json({
                success: true,
                employee: { id: bestMatch.id, name: `${bestMatch.firstname} ${bestMatch.lastname}` },
                confidence: 1 - bestMatch.distance
            });
        }

        // Face recognition not found
        return NextResponse.json({
            success: false,
            employee: null,
            confidence: 1 - bestMatch.distance
        });
    } catch (error) {
        console.error('Face recognition error:', error);
        return NextResponse.json(
            { success: false, message: 'Face recognition failed' },
            { status: 500 }
        );
    }
}