import { FaShare, FaCommentDots, FaEdit } from "react-icons/fa"
import Tooltip from "./Tooltip"
import { useEffect, useState } from "react"
import { useUser } from "../context/user"
import { useGeneralStore } from "../stores/general"
import { useRouter } from "next/navigation"
import { Comment, Like, PostMainLikesCompTypes } from "../types"
import useGetCommentsByPostId from "../hooks/useGetCommentsByPostId"
import useGetLikesByPostId from "../hooks/useGetLikesByPostId"
import useIsLiked from "../hooks/useIsLiked"
import useCreateLike from "../hooks/useCreateLike"
import useDeleteLike from "../hooks/useDeleteLike"
import useCreateRichText from "../hooks/useCreateRichText"
import useGetRichTextByPostId from "../hooks/useGetRichTextByPostId"
import EditorModal from "../components/EditorModal"
import LikeButton from "../components/LikeButton"

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {
    let { setIsLoginOpen } = useGeneralStore();

    const router = useRouter()
    const contextUser = useUser()
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [likes, setLikes] = useState<Like[]>([])
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false) // State for editor visibility
    const [isSaving, setIsSaving] = useState<boolean>(false)
    // Using isEditorOpen state to control editor visibility
    const [richTextContent, setRichTextContent] = useState<string | undefined>(undefined) // State for rich text content
    const [shareCount, setShareCount] = useState<number>(0) // State for share count

    useEffect(() => {
        getAllLikesByPost()
        getAllCommentsByPost()
        fetchRichTextContent()
        fetchShareCount() // Fetch share count
    }, [post])

    useEffect(() => { hasUserLikedPost() }, [likes, contextUser])

    const getAllCommentsByPost = async () => {
        let result = await useGetCommentsByPostId(post?.id)
        setComments(result)
    }

    const getAllLikesByPost = async () => {
        let result = await useGetLikesByPostId(post?.id)
        setLikes(result)
    }

    const hasUserLikedPost = () => {
        if (!contextUser) return

        if (likes?.length < 1 || !contextUser?.user?.id) {
            setUserLiked(false)
            return
        }
        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)
        setUserLiked(res ? true : false)
    }

    const like = async () => {
        setHasClickedLike(true)
        await useCreateLike(contextUser?.user?.id || '', post?.id)
        await getAllLikesByPost()
        setHasClickedLike(false)
    }

    const unlike = async (id: string) => {
        setHasClickedLike(true)
        await useDeleteLike(id)
        await getAllLikesByPost()
        hasUserLikedPost()
        setHasClickedLike(false)
    }

    const likeOrUnlike = () => {
        if (!contextUser?.user?.id) {
            setIsLoginOpen(true)
            return
        }

        let res = useIsLiked(contextUser?.user?.id, post?.id, likes)

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
        // Replace with actual API call to fetch share count
        try {
            const response = await fetch(`/api/shares?postId=${post.id}`);
            const data = await response.json();
            setShareCount(data.count);
        } catch (error) {
            console.error("Error fetching share count:", error);
        }
    }

    const handleSaveContent = async (content: any) => {
        if (!contextUser?.user?.id) {
            setIsLoginOpen(true)
            return
        }

        try {
            setIsSaving(true)
            await useCreateRichText(contextUser.user.id, post?.id, content)
            await fetchRichTextContent()
            setIsEditorOpen(false)
            setIsSaving(false)
        } catch (error) {
            setIsSaving(false)
            alert('Error saving content')
        }
    };

    // Edit functionality is handled through the isEditorOpen state

    return (
        <>
            <div id={`PostMainLikes-${post?.id}`} className="relative z-10 bg-black bg-opacity-50 rounded-2xl py-3 px-2 shadow-lg">
                <div className="flex flex-col items-center gap-4">
                    <Tooltip text="Like">
                        <LikeButton
                            hasClickedLike={hasClickedLike}
                            userLiked={userLiked}
                            likes={likes}
                            likeOrUnlike={likeOrUnlike}
                        />
                    </Tooltip>

                    <Tooltip text="Comments">
                        <button
                            onClick={() => router.push(`/post/${post?.id}/${post?.profile?.user_id}`)}
                            className="flex flex-col items-center"
                        >
                            {/* Added dark mode background and icon color */}
                            <div className="rounded-full bg-gray-900 p-3 cursor-pointer hover:bg-gray-800">
                                <FaCommentDots size="22" className="text-white"/>
                            </div>
                            {/* Added dark mode text color */}
                            <span className="text-xs text-white font-semibold">{comments?.length}</span>
                        </button>
                    </Tooltip>

                    <Tooltip text="Share">
                        <button className="flex flex-col items-center">
                            {/* Added dark mode background and icon color */}
                            <div className="rounded-full bg-gray-900 p-3 cursor-pointer hover:bg-gray-800">
                                <FaShare size="22" className="text-white"/>
                            </div>
                            {/* Added dark mode text color */}
                            <span className="text-xs text-white font-semibold">{shareCount}</span> {/* Display share count */}
                        </button>
                    </Tooltip>

                    <Tooltip text="Add Note">
                        <button
                            onClick={() => setIsEditorOpen(!isEditorOpen)}
                            className="flex flex-col items-center"
                        >
                            {/* Added dark mode background and icon color */}
                            <div className="rounded-full bg-gray-900 p-3 cursor-pointer hover:bg-gray-800 flex items-center justify-center">
                                <FaEdit size="22" className="text-white"/>
                            </div>
                        </button>
                    </Tooltip>
                </div>
            </div>

            {isEditorOpen && contextUser?.user?.id && (
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
