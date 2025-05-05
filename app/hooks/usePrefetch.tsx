"use client";

import { useEffect } from 'react';
import { useProfileStore } from '@/app/stores/profile';
import { usePostStore } from '@/app/stores/post';
import { useFollowStore } from '@/app/stores/follow';
import { useGeneralStore } from '@/app/stores/general';

/**
 * Hook to prefetch data for faster page loading
 */
const usePrefetch = () => {
  const { setCurrentProfile } = useProfileStore();
  const { setPostsByUser } = usePostStore();
  const { setFollowers, setFollowing, setFollowCounts } = useFollowStore();
  const { setRandomUsers, setPopularUsers } = useGeneralStore();

  useEffect(() => {
    // Prefetch random and popular users for sidebar
    setRandomUsers();
    setPopularUsers();

    // Prefetch current user's profile data if available
    const prefetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          // Start prefetching in parallel
          const profilePromise = setCurrentProfile(userId);
          const postsPromise = setPostsByUser(userId);
          const followersPromise = setFollowers(userId);
          const followingPromise = setFollowing(userId);
          const followCountsPromise = setFollowCounts(userId);
          
          // Wait for all prefetching to complete
          await Promise.allSettled([
            profilePromise, 
            postsPromise, 
            followersPromise, 
            followingPromise, 
            followCountsPromise
          ]);
          
          console.log('Prefetching completed for user:', userId);
        } catch (error) {
          console.error('Error during prefetching:', error);
        }
      }
    };

    prefetchUserData();
  }, []);
};

export default usePrefetch;
