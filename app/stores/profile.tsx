import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { Profile } from '../types';
import useGetProfileByUserId from '../hooks/useGetProfileByUserId';

interface ProfileStore {
    currentProfile: Profile | null;
    setCurrentProfile: (userId: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
    devtools(
        persist(
            (set) => ({
                currentProfile: null,

                setCurrentProfile: async (userId: string) => {
                    try {
                        console.log('(Store) Fetching profile for user ID:', userId);
                        const result = await useGetProfileByUserId(userId);
                        console.log('(Store) Profile fetch result:', result);

                        // Only update state if we got valid results
                        if (result && result.id) {
                            set({ currentProfile: result });
                        } else {
                            console.warn('(Store) No valid profile data returned for user ID:', userId);
                            // Clear the profile state if the fetch fails or returns no data
                            set({ currentProfile: null });
                        }
                    } catch (error) {
                        console.error('(Store) Error fetching profile:', error);
                        // Clear the profile state on error
                        set({ currentProfile: null });
                    }
                },
            }),
            {
                name: 'store',
                storage: createJSONStorage(() => localStorage)
            }
        )
    )
)
