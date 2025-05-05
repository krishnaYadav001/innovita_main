import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { RandomUsers } from '../types';
import useGetRandomUsers from '../hooks/useGetRandomUsers';
import getPopularUsers from '../hooks/useGetPopularUsers';
import useGetFollowingForSidebar from '../hooks/useGetFollowingForSidebar';

interface GeneralStore {
    isLoginOpen: boolean,
    isEditProfileOpen: boolean,
    isSidebarExpanded: boolean,
    isMobileView: boolean,
    randomUsers: RandomUsers[],
    popularUsers: RandomUsers[],
    allPopularUsers: RandomUsers[],
    followingUsers: RandomUsers[],
    showAllUsers: boolean,
    setIsLoginOpen: (val: boolean) => void,
    setIsEditProfileOpen: (val: boolean) => void,
    setIsSidebarExpanded: (val: boolean) => void,
    toggleSidebar: () => void,
    setIsMobileView: (val: boolean) => void,
    setRandomUsers: () => void,
    setPopularUsers: () => void,
    setFollowingUsers: (userId: string) => void,
    setShowAllUsers: (val: boolean) => void,
}

export const useGeneralStore = create<GeneralStore>()(
    devtools(
        persist(
            (set) => ({
                isLoginOpen: false,
                isEditProfileOpen: false,
                isSidebarExpanded: true, // Default to server-rendered state (desktop)
                isMobileView: false, // Default to server-rendered state (desktop)
                randomUsers: [],
                popularUsers: [],
                allPopularUsers: [],
                followingUsers: [],
                showAllUsers: false,

                setIsLoginOpen: (val: boolean) => set({ isLoginOpen: val }),
                setIsEditProfileOpen: (val: boolean) => set({ isEditProfileOpen: val }),
                setIsSidebarExpanded: (val: boolean) => set({ isSidebarExpanded: val }),
                toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
                setIsMobileView: (val: boolean) => set({ isMobileView: val }),
                setShowAllUsers: (val: boolean) => set({ showAllUsers: val }),
                setRandomUsers: async () => {
                    const result = await useGetRandomUsers()
                    set({ randomUsers: result })
                },
                setPopularUsers: async () => {
                    try {
                        // Get top 3 popular users for the sidebar
                        const topUsers = await getPopularUsers(3);

                        // Get all popular users for the "See all" view
                        const allUsers = await getPopularUsers();

                        // Convert to RandomUsers format
                        const topRandomUsers = topUsers.map(user => ({
                            id: user.user_id,
                            name: user.name,
                            image: user.image
                        }));

                        const allRandomUsers = allUsers.map(user => ({
                            id: user.user_id,
                            name: user.name,
                            image: user.image
                        }));

                        set({
                            popularUsers: topRandomUsers,
                            allPopularUsers: allRandomUsers
                        });
                    } catch (error) {
                        console.error('Error fetching popular users:', error);
                    }
                },
                setFollowingUsers: async (userId: string) => {
                    try {
                        // Check if we're in a browser environment
                        if (typeof window === 'undefined') return;

                        if (!userId) {
                            // If no user ID, set empty array
                            set({ followingUsers: [] });
                            return;
                        }

                        // Get users that the current user is following
                        // This will return random users if not authenticated
                        const followingUsers = await useGetFollowingForSidebar(userId);

                        set({ followingUsers });
                    } catch (error) {
                        console.error('Error fetching following users:', error);
                        // Set empty array on error
                        set({ followingUsers: [] });
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
