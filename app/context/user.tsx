"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccount, ID } from "@/libs/AppWriteClient" // Use getter function
import { User, UserContextTypes } from '../types';
import { useRouter } from 'next/navigation';
import useGetProfileByUserId from '../hooks/useGetProfileByUserId';
import useCreateProfile from '../hooks/useCreateProfile'; // Already imported, no change needed here, but good to verify

const UserContext = createContext<UserContextTypes | null>(null);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Initialize as true

  const checkUser = async () => {
    setIsLoadingUser(true); // Set loading true at the start of check
    try {
      // First check if we have a valid session
      try {
        await getAccount().getSession("current"); // Use getter
      } catch (sessionError) {
        console.log('No valid session found:', sessionError);
        setUser(null);
        setIsLoadingUser(false);
        return false; // Return false to indicate failure
      }

      // If we get here, we have a valid session
      try {
        const userData = await getAccount().get() as any; // Use getter
        console.log('User authenticated successfully:', userData?.$id);

        try {
          // Try to get the profile, but don't fail if profile doesn't exist
          const profile = await useGetProfileByUserId(userData?.$id);

          const userId = userData?.$id;

          // Store user ID in localStorage for sidebar refresh purposes
          if (userId && typeof window !== 'undefined') {
            localStorage.setItem('userId', userId);
          }

          setUser({
            id: userId,
            name: userData?.name,
            bio: profile?.bio || '',
            image: profile?.image || String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID)
          });

          return true; // Return true to indicate success
        } catch (profileError) {
          // Profile fetch failed (useGetProfileByUserId now handles creation)
          console.error('(Context) Error getting user profile during checkUser. useGetProfileByUserId should handle creation. Setting user to null.', profileError);
          // Set user to null if profile fetch fails fundamentally
          setUser(null);
          return false; // Return false to indicate failure
        }
      } catch (accountError) {
        console.error('Error getting user account:', accountError);
        setUser(null);
        return false; // Return false to indicate failure
      }
    } catch (error) {
      console.error('Unexpected error in checkUser:', error);
      setUser(null);
      return false; // Return false to indicate failure
    } finally {
      setIsLoadingUser(false); // Set loading false when check completes (success or error)
    }
  };

  useEffect(() => {
    console.log('Checking user authentication state...');
    checkUser();
  }, []);

  const register = async (name: string, email: string, password: string) => {

    try {
      const promise = await getAccount().create(ID.unique(), email, password, name) // Use getter
      await getAccount().createEmailSession(email, password); // Use getter

      await useCreateProfile(promise?.$id, name, String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID), '')
      await checkUser()

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await getAccount().createEmailSession(email, password); // Use getter
      const result = await checkUser(); // Await the check after session creation

      // If we get here but user is still null, it means login succeeded but profile retrieval failed
      if (!user) {
        console.error('Login succeeded but user profile could not be retrieved');
        throw new Error('Login succeeded but we could not retrieve your profile. Please try again.');
      }

      return result;
    } catch (error: any) {
      console.error('Login error:', error);

      // Log the detailed error for debugging
      if (error.code) {
        console.error(`Appwrite error code: ${error.code}, message: ${error.message}`);
      }

      // Provide specific error messages based on error codes
      if (error.code === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else {
        // Generic error message for other cases
        throw new Error('Login failed. Please check your credentials and try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await getAccount().deleteSession('current'); // Use getter
      setUser(null);

      // Remove user ID from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
      }

      router.refresh()
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <UserContext.Provider value={{ user, isLoadingUser, register, login, logout, checkUser }}>
          {children}
      </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => useContext(UserContext)
