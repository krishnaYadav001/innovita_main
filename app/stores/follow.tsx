import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { FollowWithProfile } from '../types';
import useGetFollowers from '../hooks/useGetFollowers';
import useGetFollowing from '../hooks/useGetFollowing';
import useGetFollowCounts from '../hooks/useGetFollowCounts';

interface FollowStore {
  followers: FollowWithProfile[];
  following: FollowWithProfile[];
  followCounts: {
    followers: number;
    following: number;
  };
  setFollowers: (userId: string) => void;
  setFollowing: (userId: string) => void;
  setFollowCounts: (userId: string) => void;
}

export const useFollowStore = create<FollowStore>()(
  devtools(
    persist(
      (set) => ({
        followers: [],
        following: [],
        followCounts: {
          followers: 0,
          following: 0
        },

        setFollowers: async (userId: string) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') return;

            console.log('Fetching followers for user ID:', userId);
            const result = await useGetFollowers(userId);
            console.log('Followers result:', result);

            // Only update state if we got valid results
            if (result && Array.isArray(result)) {
              set({ followers: result });
            }
          } catch (error) {
            console.error('Error setting followers:', error);
            // Don't clear existing data on error
          }
        },

        setFollowing: async (userId: string) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') return;

            console.log('Fetching following for user ID:', userId);
            const result = await useGetFollowing(userId);
            console.log('Following result:', result);

            // Only update state if we got valid results
            if (result && Array.isArray(result)) {
              set({ following: result });
            }
          } catch (error) {
            console.error('Error setting following:', error);
            // Don't clear existing data on error
          }
        },

        setFollowCounts: async (userId: string) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') return;

            console.log('Fetching follow counts for user ID:', userId);
            const result = await useGetFollowCounts(userId);
            console.log('Follow counts result:', result);

            // Only update state if we got valid results
            if (result && typeof result.followers === 'number' && typeof result.following === 'number') {
              set({ followCounts: result });
            }
          } catch (error) {
            console.error('Error setting follow counts:', error);
            // Don't clear existing data on error
          }
        },
      }),
      {
        name: 'follow-store',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);
