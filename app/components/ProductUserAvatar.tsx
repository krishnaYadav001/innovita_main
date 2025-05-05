"use client"

import { useState, useEffect } from 'react';
import useGetProfileByUserId from '@/app/hooks/useGetProfileByUserId';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import { BiLoaderCircle } from 'react-icons/bi';

interface ProductUserAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProductUserAvatar({ userId, size = 'md', className = '' }: ProductUserAvatarProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const profileData = await useGetProfileByUserId(userId);
        setProfile(profileData);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Determine size class
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }[size];

  if (isLoading) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <BiLoaderCircle className="animate-spin text-gray-400 dark:text-gray-500" size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden ${className}`} title={profile.name || 'User'}>
      <img
        src={profile.image ? useCreateBucketUrl(profile.image) : '/images/placeholder-user.png'}
        alt={profile.name || 'User'}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Prevent infinite loops by using a local fallback
          e.currentTarget.onerror = null; // Remove the error handler
          e.currentTarget.src = '/images/placeholder-user.png';
        }}
      />
    </div>
  );
}
