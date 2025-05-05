import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { CommentWithProfile } from '../types';
import useGetCommentsByPostId from '../hooks/useGetCommentsByPostId';
  
interface CommentStore {
    commentsByPost: CommentWithProfile[]
    setCommentsByPost: (postId: string) => void;
    addComment: (comment: CommentWithProfile) => void; // Add new function signature
}

export const useCommentStore = create<CommentStore>()(
    devtools(
        persist(
            (set) => ({
                commentsByPost: [],

                setCommentsByPost: async (postId: string) => {
                    try { // Add try block
                        const result = await useGetCommentsByPostId(postId);
                        set({ commentsByPost: result });
                    } catch (error) { // Add catch block
                        console.error("Failed to fetch comments:", error);
                        set({ commentsByPost: [] }); // Set to empty array on error to prevent crash
                    }
                },

                addComment: (comment: CommentWithProfile) => {
                    set((state) => ({
                        commentsByPost: [comment, ...state.commentsByPost],
                    }));
                },
            }),
            {
                name: 'store', 
                storage: createJSONStorage(() => localStorage) 
            }
        )
    )
)
