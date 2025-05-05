import { useUser } from "@/app/context/user"
import Link from "next/link"
import { useState } from "react"
import { BiLoaderCircle } from "react-icons/bi"
import { BsTrash3 } from "react-icons/bs"
import { useCommentStore } from "@/app/stores/comment"
import moment from "moment"
import useDeleteComment from "@/app/hooks/useDeleteComment"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { SingleCommentCompTypes } from "@/app/types"

export default function SingleComment({ comment, params }: SingleCommentCompTypes) {

    const contextUser = useUser()
    let { setCommentsByPost } = useCommentStore()
    const [isDeleting, setIsDeleting] = useState(false)

    const deleteThisComment = async () => {
        let res = confirm("Are you sure you want to delete this comment?") // Corrected typo: weant -> want
        if (!res) return

        try {
            setIsDeleting(true)
            await useDeleteComment(comment?.id)
            setCommentsByPost(params?.postId)
            // No need to set isDeleting false here, component might unmount
        } catch (error) {
            console.log(error)
            alert(error)
            setIsDeleting(false) // Set false on error
        }
        // Removed setIsDeleting(false) from here as it might not be reached if successful
    }
    return (
        <>
            <div id="SingleComment" className="flex items-start justify-between px-4 sm:px-8 mt-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start relative w-full">
                    <Link href={`/profile/${comment.profile.user_id}`} className="flex-shrink-0 mt-1">
                        <img
                            className="rounded-full"
                            width="36"
                            height="36"
                            src={useCreateBucketUrl(comment.profile.image)}
                            alt={`${comment.profile.name}'s profile`}
                        />
                    </Link>
                    <div className="ml-3 sm:ml-4 w-full">
                        <div className="flex items-center justify-between">
                            {/* Username */}
                            <span className="text-[16px] sm:text-[17px] font-semibold text-black dark:text-white">
                                {comment?.profile?.name}
                            </span>

                            {/* Delete Button */}
                            {contextUser?.user?.id == comment.profile.user_id ? (
                                <button
                                    disabled={isDeleting}
                                    onClick={() => deleteThisComment()}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="Delete comment"
                                >
                                    {isDeleting
                                        ? <BiLoaderCircle className="animate-spin text-[#E91E62] dark:text-white" size="18"/>
                                        : <BsTrash3 className="cursor-pointer text-black dark:text-white" size="18"/>
                                    }
                                </button>
                            ) : null}
                        </div>

                        {/* Comment Text */}
                        <p className="text-[14px] sm:text-[15px] font-normal text-black dark:text-gray-200 break-words mt-1">{comment.text}</p>

                        {/* Timestamp */}
                        <div className="text-[11px] sm:text-[12px] font-light text-gray-500 dark:text-gray-400 mt-1">
                            {moment(comment?.created_at).calendar()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
