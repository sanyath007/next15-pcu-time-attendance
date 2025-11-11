import { User, Clock } from 'lucide-react';
import moment from 'moment-timezone';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ImageCell } from '@/app/(protected)/attendance/ImageCell';
import FilteringForm from './FilteringForm';

interface Employee {
    id: string;
    prefix: string;
    firstname: string;
    lastname: string;
};

interface Attendance {
    id: string;
    employee_id: string;
    check_in_time: Date;
    check_in_image: string;
    check_in_score: number;
    check_out_time?: Date;
    check_out_image?: string;
    employee: Employee;
    created_at: Date;
    updated_at: Date;
};

const getAttendances = async (date: string = moment().format('YYYY-MM-DD')): Promise<Attendance[]> => {
    const res = await fetch(`http:localhost:3000/api/attendances?date=${date}`, { method: 'GET' });
    return res.json();
};

export default async function  CheckInPage({ searchParams }: { searchParams: { date: string }}) {
    const { date } = await searchParams;

    const { data: attendances } = await getAttendances(date);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Time Attendance System</h1>
                            <p className="text-gray-600">Employee Check-In</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-5 h-5" />
                            <span className="text-lg font-semibold">
                                {/* {currentTime.toLocaleTimeString()} */}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {/* {currentTime.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })} */}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">รายการลงเวลาปฏิบัติงาน</h2>
                        <FilteringForm />
                    </div>
                    
                    <div className="space-y-4 mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[5%] text-center">ลำดับ</TableHead>
                                    <TableHead className="w-[25%]">ชื่อ-สกุล</TableHead>
                                    <TableHead className="w-[15%] text-center">เวลา</TableHead>
                                    <TableHead className="w-[8%] text-center">Score</TableHead>
                                    <TableHead className="w-[8%] text-center">รูปถ่าย</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendances.map((att: Attendance, index: number) => (
                                    <TableRow key={att.id}>
                                        <TableCell className="text-center">{index+1}</TableCell>
                                        <TableCell>
                                            {`${att.employee?.prefix}${att.employee?.firstname} ${att.employee?.lastname}`}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {moment(att.check_in_time).format('DD/MM/YYYY HH:mm')}
                                        </TableCell>
                                        <TableCell className="text-center">{att.check_in_score}</TableCell>
                                        <ImageCell url={att.check_in_image} />
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell className="text-right" colSpan={4}>Total</TableCell>
                                    <TableCell className="text-center">{attendances.length} ราย</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}