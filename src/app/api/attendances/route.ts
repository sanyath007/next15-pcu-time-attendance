import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const date = request.nextUrl?.searchParams.get('date');
    
        let filters = {};
        if (date) {
            filters.check_in_time = { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) };
        }

        const attendances = await db.attendance.findMany(
            {
                where: filters,
                include: {
                    employee: true,
                }
            }
        );

        return NextResponse.json({ status: 200, data: attendances });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ status: 500, message: 'Something went wrong!' });
    }
}