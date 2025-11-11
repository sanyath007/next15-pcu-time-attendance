import { redirect } from 'next/navigation';
// import { auth } from '@/auth';
import { UserPlus } from 'lucide-react';
import EmployeeRegistrationForm from './Form';

export default async function EmployeeRegistration() {
    // const sesstion = await auth();

    // if (!sesstion) redirect("/signin");

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-3 rounded-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Employee Registration</h1>
                        <p className="text-gray-600">Register new employee with facial recognition</p>
                    </div>
                </div>
            </div>

            <EmployeeRegistrationForm />

        </div>
    );
}