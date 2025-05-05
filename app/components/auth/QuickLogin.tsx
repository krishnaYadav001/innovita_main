"use client"

import { useState } from 'react';
import { useUser } from '@/app/context/user';
import { BiLoaderCircle } from 'react-icons/bi';

export default function QuickLogin() {
    const userContext = useUser(); // Get the whole context
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('Test123!');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async () => {
        // Check if context and login function exist
        if (!userContext || !userContext.login) {
            setError('Login context not available. Please try again later.');
            return;
        }

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await userContext.login(email, password); // Use login from context
            setSuccess('Login successful! Redirecting...');

            // Redirect to home page after 1 second
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Quick Login</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
                    {success}
                </div>
            )}
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                />
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your password"
                />
            </div>
            
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <BiLoaderCircle className="animate-spin mr-2" size={20} />
                        Logging in...
                    </>
                ) : (
                    'Login'
                )}
            </button>
            
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Use the credentials you created in the AppWrite console
            </p>
        </div>
    );
}
