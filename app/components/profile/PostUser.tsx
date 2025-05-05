import { AiOutlineLoading3Quarters, AiFillHeart, AiFillEye } from "react-icons/ai"
import { SiSoundcharts } from "react-icons/si"
import { BiErrorCircle, BiComment } from "react-icons/bi"
import { useEffect, useState } from "react"
import Link from "next/link"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { PostUserCompTypes } from "@/app/types"
import { useTheme } from "@/app/context/theme"

export default function PostUser({ post }: PostUserCompTypes) {
    const { theme } = useTheme()
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        const video = document.getElementById(`video${post?.id}`) as HTMLVideoElement

        setTimeout(() => {
            video.addEventListener('mouseenter', () => {
                video.play()
                setIsHovering(true)
            })
            video.addEventListener('mouseleave', () => {
                video.pause()
                setIsHovering(false)
            })
        }, 50)

    }, [])

    return (
        <>
            <div className="relative group overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
               {!post.video_url ? (
                    <div className="absolute flex items-center justify-center top-0 left-0 aspect-[3/4] w-full object-cover bg-black">
                        <AiOutlineLoading3Quarters className="animate-spin ml-1" size="80" color="#FFFFFF" />
                    </div>
                ) : (
                    <Link href={`/post/${post.id}/${post.user_id}`} className="block overflow-hidden">
                        <div className="relative aspect-[3/4] overflow-hidden">
                            <video
                                id={`video${post.id}`}
                                muted
                                loop
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                src={useCreateBucketUrl(post.video_url)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Overlay stats that appear on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-white">
                                        <AiFillHeart size="16" className="text-white" />
                                        <span className="text-xs font-medium">3.2K</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-white">
                                        <BiComment size="16" className="text-white" />
                                        <span className="text-xs font-medium">42</span>
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-white">
                                    <AiFillEye size="16" className="text-white" />
                                    <span className="text-xs font-medium">12.5K</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                )}
                <div className="p-3">
                    <p className="text-gray-700 dark:text-gray-300 text-[15px] font-medium line-clamp-2 mb-2 hover:text-[#F02C56] dark:hover:text-[#F02C56] transition-colors">
                        {post.text}
                    </p>
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 hover:text-[#F02C56] transition-colors">
                                <SiSoundcharts size="14" className="text-[#F02C56]"/>
                                <span>3.2K</span>
                            </span>
                            <span className="h-1 w-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <BiErrorCircle size="16" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"/>
                    </div>
                </div>
            </div>
        </>
    )
}
