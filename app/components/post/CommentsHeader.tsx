"use client"

import Link from "next/link"
import { AiFillHeart } from "react-icons/ai"
import { BsChatDots, BsTrash3 } from "react-icons/bs"
import { ImMusic } from "react-icons/im"
import moment from "moment"
import { useUser } from "@/app/context/user"
import { useEffect, useState } from "react"
import { BiLoaderCircle } from "react-icons/bi"
import ClientOnly from "../ClientOnly"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { useLikeStore } from "@/app/stores/like"
import { useCommentStore } from "@/app/stores/comment"
import { useGeneralStore } from "@/app/stores/general"
import { useRouter } from "next/navigation"
import useIsLiked from "@/app/hooks/useIsLiked"
import useCreateLike from "@/app/hooks/useCreateLike"
import useDeleteLike from "@/app/hooks/useDeleteLike"
import useDeletePostById from "@/app/hooks/useDeletePostById"; // Import the hook factory
import { CommentsHeaderCompTypes } from "@/app/types";
import { useTheme } from "@/app/context/theme"; // Import useTheme
import FollowButton from "@/app/components/FollowButton";

export default function CommentsHeader({ post, params }: CommentsHeaderCompTypes) {

    let { setLikesByPost, likesByPost } = useLikeStore()
    let { commentsByPost, setCommentsByPost } = useCommentStore()
    let { setIsLoginOpen } = useGeneralStore()

    const contextUser = useUser()
    const router = useRouter()
    const { theme } = useTheme(); // Get theme
    const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
    const [isDeleteing, setIsDeleteing] = useState<boolean>(false)
    const [userLiked, setUserLiked] = useState<boolean>(false);
    // Get the delete function from the hook
    const { deletePostAndProduct } = useDeletePostById();

    useEffect(() => {
        setCommentsByPost(params?.postId)
        setLikesByPost(params?.postId)
    }, [post, params?.postId, setCommentsByPost, setLikesByPost]) // Added dependencies
    useEffect(() => { hasUserLikedPost() }, [likesByPost, contextUser]) // Keep dependencies

    const hasUserLikedPost = () => {
        if (likesByPost.length < 1 || !contextUser?.user?.id) {
            setUserLiked(false)
            return
        }
        let res = useIsLiked(contextUser.user.id, params.postId, likesByPost)
        setUserLiked(res ? true : false)
    }

    const like = async () => {
        try {
            setHasClickedLike(true)
            await useCreateLike(contextUser?.user?.id || '', params.postId)
            setLikesByPost(params.postId)
            setHasClickedLike(false)
        } catch (error) {
            console.log(error)
            alert(error)
            setHasClickedLike(false)
        }
    }

    const unlike = async (id: string) => {
        try {
            setHasClickedLike(true)
            await useDeleteLike(id)
            setLikesByPost(params.postId)
            setHasClickedLike(false)
        } catch (error) {
            console.log(error)
            alert(error)
            setHasClickedLike(false)
        }
    }

    const likeOrUnlike = () => {
        if (!contextUser?.user) return setIsLoginOpen(true)

        let res = useIsLiked(contextUser.user.id, params.postId, likesByPost)
        if (!res) {
            like()
        } else {
            likesByPost.forEach(like => {
                if (contextUser?.user?.id && contextUser.user.id == like.user_id && like.post_id == params.postId) {
                    unlike(like.id)
                }
            })
        }
    }

    const deletePost = async () => {
        let res = confirm('Are you sure you want to delete this post?')
        if (!res) return

        setIsDeleteing(true)

        try {
            // Call the function returned by the hook
            // Ensure postId and video_url are definitely strings before calling
            if (params?.postId && post?.video_url) {
                await deletePostAndProduct(params.postId, post.video_url);
            } else {
                throw new Error("Missing postId or video_url for deletion.");
            }
            router.push(`/profile/${params.userId}`)
            setIsDeleteing(false)
        } catch (error) {
            console.log(error)
            setIsDeleteing(false)
            alert(error)
        }
    }
    return (
        <>
            <div className="flex items-center justify-between px-8">
                <div className="flex items-center">
                    <Link href={`/profile/${post?.user_id}`}>
                        {post?.profile.image ? (
                            <img className="rounded-full lg:mx-0 mx-auto" width="40" src={useCreateBucketUrl(post?.profile.image)} />
                        ) : (
                            <div className="w-[40px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        )}
                    </Link>
                    <div className="ml-3 pt-0.5">

                        <Link
                            href={`/profile/${post?.user_id}`}
                            className="relative z-10 text-[17px] font-semibold hover:underline text-black dark:text-white"
                        >
                            {post?.profile.name}
                        </Link>

                        {/* Adjusted text colors */}
                        <div className="relative z-0 text-[13px] -mt-5 font-light text-gray-600 dark:text-gray-400">
                            {post?.profile.name}
                            <span className="relative -top-[2px] text-[30px] pl-1 pr-0.5 ">.</span>
                            <span className="font-medium">{moment(post?.created_at).calendar()}</span>
                        </div>
                    </div>
                </div>

                {/* Add Follow Button if not the current user's post */}
                {contextUser?.user?.id !== post?.user_id && (
                    <FollowButton targetUserId={post?.user_id} className="px-[21px] py-0.5" />
                )}

                {contextUser?.user?.id == post?.user_id ? (
                    <div>
                        {isDeleteing ? (
                            <BiLoaderCircle className="animate-spin text-black dark:text-white" size="25"/>
                        ) : (
                            <button disabled={isDeleteing} onClick={() => deletePost()}>
                                <BsTrash3 className="cursor-pointer text-black dark:text-white" size="25"/>
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Added dark mode text */}
            <p className="px-8 mt-4 text-sm text-black dark:text-white">{post?.text}</p>

            {/* Added dark mode text and icon color */}
            <p className="flex item-center gap-2 px-8 mt-4 text-sm font-bold text-black dark:text-white">
                <ImMusic size="17"/>
                original sound - {post?.profile.name}
            </p>

            <div className="flex items-center px-8 mt-8">
                <ClientOnly>
                    <div className="pb-4 text-center flex items-center">
                        {/* Updated LikeButton background and text */}
                        <button
                            disabled={hasClickedLike}
                            onClick={() => likeOrUnlike()}
                            className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 cursor-pointer"
                        >
                            {!hasClickedLike ? (
                                <AiFillHeart color={likesByPost.length > 0 && userLiked ? '#ff2626' : (theme === 'dark' ? '#FFFFFF' : '#000000')} size="25"/>
                            ) : (
                                <BiLoaderCircle className="animate-spin text-black dark:text-white" size="25"/>
                            )}
                        </button>
                        <span className="text-xs pl-2 pr-4 text-gray-800 dark:text-gray-300 font-semibold">
                            {likesByPost.length}
                        </span>
                    </div>
                </ClientOnly>

                <div className="pb-4 text-center flex items-center">
                    {/* Updated Comment button background, icon, text */}
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 cursor-pointer">
                        <BsChatDots size={25} className="text-black dark:text-white"/>
                    </div>
                    <span className="text-xs pl-2 text-gray-800 dark:text-gray-300 font-semibold">{commentsByPost?.length}</span>
                </div>
            </div>
        </>
    )
}
