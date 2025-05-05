import { FaShare, FaCommentDots } from "react-icons/fa"
import dynamic from 'next/dynamic'
import Tooltip from "../Tooltip"

// Dynamically import RichTextPreviewButton with no SSR
const RichTextPreviewButton = dynamic(() => import("../RichTextPreviewButton"), {
  ssr: false,
});
import { useEffect, useState } from "react"
import { useUser } from "../../context/user" // Adjusted path
import { useGeneralStore } from "../../stores/general" // Adjusted path
import { useRouter } from "next/navigation"
import { Comment, Like, PostMainLikesCompTypes } from "../../types" // Adjusted path
import useGetCommentsByPostId from "../../hooks/useGetCommentsByPostId" // Adjusted path
import useGetLikesByPostId from "../../hooks/useGetLikesByPostId" // Adjusted path
import useIsLiked from "../../hooks/useIsLiked" // Adjusted path
import useCreateLike from "../../hooks/useCreateLike" // Adjusted path
import useDeleteLike from "../../hooks/useDeleteLike" // Adjusted path
import useCreateRichText from "../../hooks/useCreateRichText" // Adjusted path
import useGetRichTextByPostId from "../../hooks/useGetRichTextByPostId" // Adjusted path
// Dynamically import EditorModal with no SSR
const EditorModal = dynamic(() => import("../EditorModal"), {
  ssr: false,
});
import LikeButton from "../LikeButton" // Adjusted path

// Renamed type for clarity, using the same structure
interface PostActionButtonsProps extends PostMainLikesCompTypes {
    layout?: 'vertical' | 'horizontal';
}

export default function PostActionButtons({ post, layout = 'vertical' }: PostActionButtonsProps) { // Added layout prop
    let { setIsLoginOpen } = useGeneralStore();

    const router = useRouter()
    const contextUser = useUser()
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [likes, setLikes] = useState<Like[]>([])
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [richTextContent, setRichTextContent] = useState<string | undefined>(undefined)
    const [shareCount, setShareCount] = useState<number>(0)

    useEffect(() => {
        getAllLikesByPost()
        getAllCommentsByPost()
        fetchRichTextContent()
        fetchShareCount()
    }, [post])

    useEffect(() => { hasUserLikedPost() }, [likes, contextUser])

    const getAllCommentsByPost = async () => {
        if (!post?.id) return; // Added check
        let result = await useGetCommentsByPostId(post.id)
        setComments(result)
    }

    const getAllLikesByPost = async () => {
        if (!post?.id) return; // Added check
        let result = await useGetLikesByPostId(post.id)
        setLikes(result)
    }

    const hasUserLikedPost = () => {
        if (!contextUser?.user?.id || !post?.id) { // Added check for post.id
            setUserLiked(false)
            return
        }
        if (likes?.length < 1) {
            setUserLiked(false)
            return
        }
        let res = useIsLiked(contextUser.user.id, post.id, likes)
        setUserLiked(res ? true : false)
    }

    const like = async () => {
        if (!contextUser?.user?.id || !post?.id) return; // Added check
        setHasClickedLike(true)
        await useCreateLike(contextUser.user.id, post.id)
        await getAllLikesByPost()
        // No need to call hasUserLikedPost here, useEffect handles it
        setHasClickedLike(false)
    }

    const unlike = async (id: string) => {
        setHasClickedLike(true)
        await useDeleteLike(id)
        await getAllLikesByPost()
        // No need to call hasUserLikedPost here, useEffect handles it
        setHasClickedLike(false)
    }

    const likeOrUnlike = () => {
        if (!contextUser?.user?.id) {
            setIsLoginOpen(true)
            return
        }
        if (!post?.id) return; // Added check

        let res = useIsLiked(contextUser.user.id, post.id, likes)

        if (!res) {
            like()
        } else {
            likes.forEach((like: Like) => {
                if (contextUser?.user?.id == like?.user_id && like?.post_id == post?.id) {
                    unlike(like?.id)
                }
            })
        }
    }

    const fetchRichTextContent = async () => {
        if (!post?.id) return
        try {
            const result = await useGetRichTextByPostId(post.id)
            setRichTextContent(result)
        } catch (error) {
            console.error("Error fetching rich text content:", error)
        }
    }

    const fetchShareCount = async () => {
        if (!post?.id) return; // Added check
        // Replace with actual API call to fetch share count
        try {
            // Assuming API route exists at /api/shares
            const response = await fetch(`/api/shares?postId=${post.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setShareCount(data.count || 0); // Ensure count is a number
        } catch (error) {
            console.error("Error fetching share count:", error);
            setShareCount(0); // Default to 0 on error
        }
    }

    const handleSaveContent = async (content: any) => {
        if (!contextUser?.user?.id || !post?.id) { // Added check
            setIsLoginOpen(true)
            return
        }

        try {
            setIsSaving(true)
            await useCreateRichText(contextUser.user.id, post.id, content)
            await fetchRichTextContent()
            setIsEditorOpen(false)
            setIsSaving(false)
        } catch (error) {
            setIsSaving(false)
            alert('Error saving content')
        }
    };

    return (
        <>
            {/* Container with conditional flex direction based on layout prop */}
            <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${layout === 'vertical' ? 'gap-4' : 'gap-8 justify-center w-full'}`}>
                <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${layout === 'horizontal' ? 'gap-2' : ''}`}>
                    <Tooltip text="Like">
                        <LikeButton
                            hasClickedLike={hasClickedLike}
                            userLiked={userLiked}
                            likes={likes}
                            likeOrUnlike={likeOrUnlike}
                            layout={layout}
                        />
                    </Tooltip>
                </div>

                <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${layout === 'horizontal' ? 'gap-2' : ''}`}>
                    <Tooltip text="Comments">
                        <button
                            onClick={() => router.push(`/post/${post?.id}/${post?.profile?.user_id}`)}
                            className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center`}
                        >
                            <div className="rounded-full bg-gray-900 bg-opacity-70 p-3 cursor-pointer hover:bg-opacity-90 transition-opacity duration-200">
                                <FaCommentDots size="22" className="text-white"/>
                            </div>
                            <span className={`text-xs text-white font-semibold drop-shadow-md ${layout === 'horizontal' ? 'ml-1' : ''}`}>{comments?.length}</span>
                        </button>
                    </Tooltip>
                </div>

                <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${layout === 'horizontal' ? 'gap-2' : ''}`}>
                    <Tooltip text="Share">
                        <button className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center`}>
                            <div className="rounded-full bg-gray-900 bg-opacity-70 p-3 cursor-pointer hover:bg-opacity-90 transition-opacity duration-200">
                                <FaShare size="22" className="text-white"/>
                            </div>
                            <span className={`text-xs text-white font-semibold drop-shadow-md ${layout === 'horizontal' ? 'ml-1' : ''}`}>{shareCount}</span>
                        </button>
                    </Tooltip>
                </div>

                <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${layout === 'horizontal' ? 'gap-2' : ''}`}>
                    <Tooltip text="Add Note">
                        <RichTextPreviewButton
                            onClick={() => setIsEditorOpen(!isEditorOpen)}
                            hasContent={!!richTextContent && richTextContent !== '<p><br></p>' && richTextContent.trim() !== ''}
                            isAuthor={contextUser?.user?.id === post?.profile?.user_id}
                            layout={layout}
                        />
                    </Tooltip>
                </div>
            </div>

            {isEditorOpen && contextUser?.user?.id && post?.id && ( // Added post?.id check
                <EditorModal
                    isSaving={isSaving}
                    handleSaveContent={handleSaveContent}
                    setIsEditorOpen={setIsEditorOpen}
                    editingContent={richTextContent}
                    currentUser={contextUser.user.id}
                    contentOwner={post?.profile?.user_id}
                    isAuthor={contextUser?.user?.id === post?.profile?.user_id}
                />
            )}
        </>
    )
}