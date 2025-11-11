'use client';

import React, { useEffect, useState } from 'react';
import { User, Clock } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="mx-auto">
                {/* Navigation */}

                {/* Main Content */}
                <div className="p-8">
                    {children}
                </div>

                {/* Footer */}
                <footer className="p-4 border-t border-t-zinc-200 text-center bg-white">
                    <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Next 15 Crash Course</p>
                </footer>
            </div>
        </div>
    );
}