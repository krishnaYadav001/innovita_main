import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { Post, PostWithProfile } from '../types';
import useGetAllPosts from '../hooks/useGetAllPosts';
import useGetPostsByUser from '../hooks/useGetPostsByUserId';
import useGetPostById from '../hooks/useGetPostById';

interface PostStore {
    allPosts: PostWithProfile[];
    postsByUser: Post[];
    postById: PostWithProfile | null;
    setAllPosts: () => void;
    setPostsByUser: (userId: string) => void;
    setPostById: (postId: string) => void;
}

export const usePostStore = create<PostStore>()(
    devtools(
        persist(
            (set) => ({
                allPosts: [],
                postsByUser: [],
                postById: null,

                setAllPosts: async () => {
                    try {
                        console.log('Fetching all posts');
                        const result = await useGetAllPosts();
                        console.log('All posts result:', result);

                        // Only update state if we got valid results
                        if (result && Array.isArray(result)) {
                            set({ allPosts: result });
                        }
                    } catch (error) {
                        console.error('Error fetching all posts:', error);
                        // Don't clear existing data on error
                    }
                },
                setPostsByUser: async (userId: string) => {
                    try {
                        console.log('Fetching posts for user ID:', userId);
                        const result = await useGetPostsByUser(userId);
                        console.log('Posts by user result:', result);

                        // Only update state if we got valid results
                        if (result && Array.isArray(result)) {
                            set({ postsByUser: result });
                        }
                    } catch (error) {
                        console.error('Error fetching posts by user:', error);
                        // Don't clear existing data on error
                    }
                },
                setPostById: async (postId: string) => {
                    try {
                        console.log('Fetching post with ID:', postId);
                        const result = await useGetPostById(postId);
                        console.log('Post by ID result:', result);

                        // Only update state if we got valid results
                        if (result && result.id) {
                            set({ postById: result });
                        }
                    } catch (error) {
                        console.error('Error fetching post by ID:', error);
                        // Don't clear existing data on error
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
