import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { db } from '@/lib/db';
import { getBase64StringFromDataURL } from '@/lib/utils';
import moment from 'moment-timezone';

export async function POST(request: NextRequest) {
    try {
        const formData  = await request.formData();

        const employee_id = formData.get("employee_id") as string || null;
        const timestamp = formData.get("timestamp") as string || null;
        const image = formData.get("image") as File || null;

        /** Save file to /uploads folder */
        const uploaded = await uploadImage(image, '.png');

        const checkInTime = moment(timestamp);
        /** Convert to locale timezone */
        // const tzOffset = checkInTime.getTimezoneOffset() * 60000;

        /** Calculate check in score */
        let score = 0;
        if (checkInTime < moment(`${checkInTime.format('YYYY-MM-DD')} 07:46:00`)) { // น้อยกว่า 7:45:59
            score = 5;
        } else if (
            checkInTime >= moment(`${checkInTime.format('YYYY-MM-DD')} 07:46:00`)
            && checkInTime < moment(`${checkInTime.format('YYYY-MM-DD')} 08:00:00`)
        ) {  // ระหว่าง 7:46:00 - 7:59:59
            score = 4;
        } else if (
            checkInTime >= moment(`${checkInTime.format('YYYY-MM-DD')} 08:00:00`)
            && checkInTime < moment(`${checkInTime.format('YYYY-MM-DD')} 08:16:00`)
        ) {  // ระหว่าง 8:00:00 - 8:15:59
            score = 3;
        } else if (
            checkInTime >= moment(`${checkInTime.format('YYYY-MM-DD')} 08:16:00`)
            && checkInTime < moment(`${checkInTime.format('YYYY-MM-DD')} 08:30:01`)
        ) {  // ระหว่าง 8:16:00 - 8:30:00
            score = 2;
        } else {    // 8:30:01 เป็นต้นไป
            score = 1;
        }

        /** Save to database */
        const attendance = await db.attendance.create({
            data: {
                employee_id: employee_id,
                check_in_time: checkInTime.toDate(),    /** Use ISO timezone */
                // check_in_time: new Date(checkInTime.getTime() - tzOffset),   /** Use locale timezone */
                check_in_image: uploaded,
                check_in_score: score,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Check-in recorded successfully',
            data: {
                employee_id,
                timestamp
            }
        });
    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to record check-in' },
            { status: 500 }
        );
    }
}

export async function uploadImage(image: string, type: string): Promise<string | null> {
    try {
        /** Convert uploading image to base64 decode */
        const decodedImg = getBase64StringFromDataURL(image);
        const buff = Buffer.from(decodedImg, 'base64');

        /** Create path to save for each uploading date */
        const relativeUploadDir = `/uploads/attendances/${new Date(Date.now())
            .toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-")}`;

        /** Join path to save with current working directory */
        const uploadDir = join(process.cwd(), "public", relativeUploadDir);

        /** Make new directory */
        await mkdir(uploadDir, { recursive: true });

        /** Generate new file name of uploading image */
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${type}`;

        /** Save file to server */
        await writeFile(`${uploadDir}/${filename}`, buff);

        return `${relativeUploadDir}/${filename}`;
    } catch (error) {
        return '';
    }
}