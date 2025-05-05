"use client"

import Comments from "@/app/components/post/Comments";
import CommentsHeader from "@/app/components/post/CommentsHeader";
import RelatedProductsModal from "@/app/components/modals/RelatedProductsModal"; // Import the new modal
import Link from "next/link";
import { useEffect, useState } from "react" // Import useState
import { AiOutlineClose } from "react-icons/ai"
import { BiChevronDown, BiChevronUp, BiLoaderCircle, BiSolidShoppingBag } from "react-icons/bi" // Import BiLoaderCircle and BiSolidShoppingBag
import { useRouter } from "next/navigation"
import ClientOnly from "@/app/components/ClientOnly"
import type { Post, CommentWithProfile } from "@/app/types"; // Import CommentWithProfile
import { PostPageTypes } from "@/app/types";
import { usePostStore } from "@/app/stores/post"
import { useLikeStore } from "@/app/stores/like"
import { useCommentStore } from "@/app/stores/comment"
import { useGeneralStore } from "@/app/stores/general" // Import useGeneralStore
import { useUser } from "@/app/context/user" // Import useUser
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import useCreateComment from '@/app/hooks/useCreateComment' // Import useCreateComment

export default function Post({ params }: PostPageTypes) {

    let { postById, postsByUser, setPostById, setPostsByUser } = usePostStore()
    let { setLikesByPost } = useLikeStore()
    // Get addCommentToStore from comment store
    let { setCommentsByPost, addComment: addCommentToStore } = useCommentStore()
    let { setIsLoginOpen } = useGeneralStore() // Get setIsLoginOpen
    const contextUser = useUser() // Get user context

    const router = useRouter()

    // State for comment input moved here
    const [comment, setComment] = useState<string>('')
    const [inputFocused, setInputFocused] = useState<boolean>(false)
    const [isUploadingComment, setIsUploadingComment] = useState<boolean>(false)

    // State for the related products modal
    const [isRelatedProductsModalOpen, setIsRelatedProductsModalOpen] = useState(false);

    useEffect(() => {
        setPostById(params.postId)
        setCommentsByPost(params.postId)
        setLikesByPost(params.postId)
        setPostsByUser(params.userId)
    }, [])

    const loopThroughPostsUp = () => {
        postsByUser.forEach(post => {
            if (post.id > params.postId) {
                router.push(`/post/${post.id}/${params.userId}`)
            }
        });
    }

    const loopThroughPostsDown = () => {
        postsByUser.forEach(post => {
            if (post.id < params.postId) {
                router.push(`/post/${post.id}/${params.userId}`)
            }
        });
    }

    // addComment function moved here, BEFORE the return statement
    const addComment = async () => {
        if (!contextUser?.user) return setIsLoginOpen(true)

        try {
            setIsUploadingComment(true);
            // Ensure user and post IDs are available
            const userId = contextUser?.user?.id;
            const postId = params?.postId;

            if (!userId || !postId) {
                console.error("User ID or Post ID missing, cannot create comment.");
                alert("Could not post comment. Please try again.");
                setIsUploadingComment(false);
                return; // Exit if IDs are missing
            }

            // Call the hook which now returns the created comment document
            const newCommentDoc = await useCreateComment(userId, postId, comment);

            // Construct the CommentWithProfile object for optimistic update
            const newCommentForStore: CommentWithProfile = {
                $id: newCommentDoc.$id,
                id: newCommentDoc.$id,
                user_id: newCommentDoc.user_id,
                post_id: newCommentDoc.post_id,
                text: newCommentDoc.text,
                created_at: newCommentDoc.created_at,
                profile: {
                    user_id: contextUser?.user?.id || '',
                    name: contextUser?.user?.name || 'User',
                    image: contextUser?.user?.image || '',
                }
            };

            // Optimistically add the comment to the store
            addCommentToStore(newCommentForStore);

            setComment(''); // Clear input
        } catch (error) {
            console.error("Error creating comment:", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsUploadingComment(false); // Reset loading state
        }
    }

    return (
        <>
            <div
                id="PostPage"
                className="lg:flex justify-between w-full h-screen bg-black dark:bg-black" /* REMOVED overflow-hidden */
            >
                <div className="lg:w-[calc(100%-540px)] h-full relative bg-black dark:bg-black overflow-hidden"> {/* Keep overflow-hidden here for video section if needed */}
                    <Link
                        href={`/profile/${params?.userId}`}
                        className="absolute text-white z-20 m-5 rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
                    >
                        <AiOutlineClose size="27"/>
                    </Link>

                    <div >
                        <button
                            onClick={() => loopThroughPostsUp()}
                            className="absolute z-20 right-4 top-4 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
                        >
                            <BiChevronUp size="30" color="#FFFFFF"/>
                        </button>

                        <button
                            onClick={() => loopThroughPostsDown()}
                            className="absolute z-20 right-4 top-20 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
                        >
                            <BiChevronDown size="30" color="#FFFFFF"/>
                        </button>
                    </div>

                    <img
                        className="absolute z-20 top-[18px] left-[70px] rounded-full lg:mx-0 mx-auto"
                        width="45"
                        src="/images/ii.png"
                    />

                    <ClientOnly>
                        {postById?.video_url ? (
                            <video
                                className="absolute object-cover w-full my-auto z-[0] h-full"
                                src={useCreateBucketUrl(postById?.video_url)}
                            />
                        ) : null}

                        <div className="bg-black dark:bg-black bg-opacity-70 lg:min-w-[480px] z-10 relative h-full w-full overflow-hidden">
                            {postById?.video_url ? (
                                <video
                                    autoPlay
                                    controls
                                    loop
                                    muted
                                    className="h-full w-full max-h-screen mx-auto object-contain"
                                    src={useCreateBucketUrl(postById.video_url)}
                                />
                            ) : null}
                        </div>
                    </ClientOnly>

                </div>

                {/* Info Section - Revert to Standard Flex Column Layout */}
                <div id="InfoSection" className="lg:max-w-[550px] w-full h-full bg-white dark:bg-gray-900 flex flex-col"> {/* Reverted to flex flex-col, ADDED h-full back, REMOVED relative */}
                    {/* Top section (Header + Related) */}
                    <div className="py-7 px-4 flex-shrink-0"> {/* ADDED flex-shrink-0 back */}
                        {/* Removed ClientOnly wrapper */}
                        {postById ? (
                            <CommentsHeader post={postById} params={params}/>
                        ) : null}
                        {/* Button to open the Related Products Modal */}
                        <button
                           onClick={() => setIsRelatedProductsModalOpen(true)}
                           className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                        >
                           <BiSolidShoppingBag size={18} />
                           <span>You Might Also Like</span>
                        </button>

                    </div>

                    {/* Comments Section Container - Takes remaining space and scrolls */}
                    <div className="flex-grow overflow-y-auto border-t dark:border-t-gray-700"> {/* REMOVED h-full, pb-*, min-h-0. ADDED flex-grow */}
                        {/* Comments component now only renders the list */}
                        <Comments params={params}/>
                    </div>

                    {/* Create Comment Input Area - Fixed height */}
                    <div
                        id="CreateComment"
                        className="flex-shrink-0 flex items-center justify-between bg-white dark:bg-gray-900 h-[75px] sm:h-[85px] w-full py-3 sm:py-5 px-4 sm:px-8 border-t-2 dark:border-t-gray-700"
                    >
                        <div
                            className={`flex items-center rounded-lg w-full border-2
                                bg-[#F1F1F2] dark:bg-gray-800
                                ${inputFocused ? 'border-gray-400 dark:border-gray-600' : 'border-[#F1F1F2] dark:border-gray-800'}
                            `}
                        >
                            <input
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                onChange={e => setComment(e.target.value)}
                                value={comment || ''}
                                className="bg-transparent text-[14px] focus:outline-none w-full p-2 rounded-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                type="text"
                                placeholder="Add comment..."
                                autoComplete="off"
                            />
                        </div>
                        {!isUploadingComment ? (
                            <button
                                disabled={!comment}
                                onClick={addComment}
                                className={`
                                    font-semibold text-sm ml-2 sm:ml-5 px-3 py-1.5 rounded-full
                                    ${comment
                                        ? 'bg-[#F02C56] text-white cursor-pointer'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
                                `}
                            >
                                Post
                            </button>
                        ) : (
                            <div className="ml-2 sm:ml-5 px-3 py-1.5">
                                <BiLoaderCircle className="animate-spin text-[#E91E62] dark:text-white" size="20" />
                            </div>
                        )}
                    </div>
                </div> {/* Close InfoSection */}
            </div> {/* Close PostPage */}

            {/* Render the Related Products Modal */}
            <RelatedProductsModal
               isOpen={isRelatedProductsModalOpen}
               onClose={() => setIsRelatedProductsModalOpen(false)}
               primaryProductId={postById?.primary_product_id}
            />

        </>
    )
    // Removed addComment function definition from here
}
