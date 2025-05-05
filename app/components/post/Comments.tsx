import { useState } from "react"
import SingleComment from "./SingleComment"
import { useUser } from "@/app/context/user"
import { BiLoaderCircle } from "react-icons/bi"
import ClientOnly from "../ClientOnly"
import { useCommentStore } from "@/app/stores/comment"
import useCreateComment from '@/app/hooks/useCreateComment'
import { useGeneralStore } from "@/app/stores/general"
import { CommentWithProfile } from "@/app/types"; // Import the missing type
import { CommentsCompTypes } from "@/app/types"

export default function Comments({ params }: CommentsCompTypes) {

    let { commentsByPost, setCommentsByPost, addComment: addCommentToStore } = useCommentStore() // Get addComment function
    let { setIsLoginOpen } = useGeneralStore()

    const contextUser = useUser() // Make sure contextUser is defined before use
    const [comment, setComment] = useState<string>('')
    const [inputFocused, setInputFocused] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)

    const addComment = async () => {
        if (!contextUser?.user) return setIsLoginOpen(true)

        try {
            setIsUploading(true);
            // Ensure user and post IDs are available
            const userId = contextUser?.user?.id;
            const postId = params?.postId;

            if (!userId || !postId) {
                console.error("User ID or Post ID missing, cannot create comment.");
                alert("Could not post comment. Please try again.");
                setIsUploading(false);
                return; // Exit if IDs are missing
            }

            // Call the hook which now returns the created comment document
            const newCommentDoc = await useCreateComment(userId, postId, comment);

            // Construct the CommentWithProfile object for optimistic update
            // Use optional chaining for user profile data as well
            const newCommentForStore: CommentWithProfile = {
                $id: newCommentDoc.$id,
                id: newCommentDoc.$id, // Assuming id should also be $id for consistency if used elsewhere
                user_id: newCommentDoc.user_id,
                post_id: newCommentDoc.post_id,
                text: newCommentDoc.text,
                created_at: newCommentDoc.created_at,
                profile: { // Use current user's profile info safely
                    user_id: contextUser?.user?.id || '', // Provide fallback if needed
                    name: contextUser?.user?.name || 'User', // Provide fallback
                    image: contextUser?.user?.image || '', // Provide fallback
                }
            };

            // Optimistically add the comment to the store
            addCommentToStore(newCommentForStore);

            setComment(''); // Clear input
            // No need to call setCommentsByPost anymore
        } catch (error) {
            console.error("Error creating comment:", error); // Log error properly
            alert("Failed to post comment. Please try again."); // User-friendly error
            // Optionally: Implement logic to remove the optimistically added comment on failure
        } finally {
            setIsUploading(false); // Reset loading state
        }
    }

    // State and functions related to comment input are removed from here
    // and should be moved to the parent component (page.tsx)
    // const contextUser = useUser() // Moved
    // const [comment, setComment] = useState<string>('') // Moved
    // const [inputFocused, setInputFocused] = useState<boolean>(false) // Moved
    // const [isUploading, setIsUploading] = useState<boolean>(false) // Moved
    // const addComment = async () => { ... } // Moved

    return (
        // Only render the list container. Input is handled by parent.
        // Removed the outer flex div wrapper. Parent controls layout.
            <div
                id="Comments"
                className="bg-[#F8F8F8] dark:bg-gray-800 w-full px-4 sm:px-8" // Added padding here
            >
                {/* Removed pt-2 div */}
                <ClientOnly>
                    {commentsByPost.length < 1 ? (
                        <div className="text-center mt-6 text-xl text-gray-500 dark:text-gray-400">No comments...</div>
                    ) : (
                        <div className="pt-2"> {/* Add padding top only when there are comments */}
                            {commentsByPost.map((comment) => ( // Use comment.$id for key
                                <SingleComment key={comment.$id} comment={comment} params={params} />
                            ))}
                        </div>
                    )}
                </ClientOnly>
                {/* Removed spacer div */}
            </div> // Close #Comments div
        // Removed the input field JSX entirely
    )
}
