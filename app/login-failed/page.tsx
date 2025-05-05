"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/layouts/MainLayout';
import { useGeneralStore } from '@/app/stores/general';

export default function LoginFailed() {
  const router = useRouter();
  const { setIsLoginOpen } = useGeneralStore();

  // Redirect to home after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  // Function to try login again
  const handleTryAgain = () => {
    setIsLoginOpen(true);
    router.push('/');
  };

  return (
    <MainLayout>
      <div className="pt-[80px] flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Login Failed</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't complete your login. This might be due to an authentication error or because you canceled the process.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleTryAgain}
              className="bg-[#F02C56] hover:bg-[#d12a50] text-white font-medium py-2 px-4 rounded-full transition-colors"
            >
              Try Again
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-full transition-colors"
            >
              Return to Home
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            You will be redirected to the home page in 5 seconds...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
