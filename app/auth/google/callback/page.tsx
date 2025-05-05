"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account, ID } from '@/libs/AppWriteClient';
import { useUser } from '@/app/context/user';
import useCreateProfile from '@/app/hooks/useCreateProfile';
import MainLayout from '@/app/layouts/MainLayout';
import { BiLoaderCircle } from 'react-icons/bi';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contextUser = useUser();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (!code) {
        setError('No authorization code received from Google');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Processing Google OAuth callback with code:', code);

        // Note: AppWrite should have already created the session during the OAuth flow
        // We're just verifying the session exists and getting user data
        let session;
        try {
          session = await account.getSession('current');
          console.log('Verified existing session:', session);
        } catch (sessionError) {
          console.error('No valid session found:', sessionError);
          throw new Error('Authentication failed: No valid session found');
        }

        console.log('Google OAuth session created:', session);

        // Get the user account
        const userData = await account.get();
        console.log('User data retrieved:', userData);

        // Check if user profile exists, if not create one
        try {
          // Create a profile for the user if they don't have one
          await useCreateProfile(
            userData.$id,
            userData.name || 'Google User',
            String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID),
            ''
          );
          console.log('User profile created');
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue even if profile creation fails - it might already exist
        }

        // Refresh user context
        if (contextUser) {
          await contextUser.checkUser();
        }

        // Redirect to home page
        router.push('/');
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Failed to authenticate with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleCallback();
  }, [code, router, contextUser]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Authentication</h1>

            {isLoading ? (
              <div className="mt-6 flex flex-col items-center justify-center">
                <BiLoaderCircle className="animate-spin text-[#F02C56]" size={50} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Authenticating with Google...</p>
              </div>
            ) : error ? (
              <div className="mt-6">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-[#F02C56] text-white rounded-md hover:bg-opacity-90"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-green-500 dark:text-green-400">Authentication successful!</p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Redirecting you to the home page...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
