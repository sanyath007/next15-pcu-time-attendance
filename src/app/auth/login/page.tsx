'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // try {
        //     const result = await login(formData);
            
        //     if (result.success) {
        //         router.push(redirectTo);
        //     } else {
        //         setError(result.message || 'Login failed');
        //     }
        // } catch (err) {
        //     setError('An unexpected error occurred');
        // } finally {
        //     setIsLoading(false);
        // }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 w-full'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8'>
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Sign In</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <div className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a 
                            href="/auth/register" 
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Sign up here
                        </a>
                    </div>

                    <div className="mt-2">
                        <a 
                            href="/auth/forgot-password" 
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}