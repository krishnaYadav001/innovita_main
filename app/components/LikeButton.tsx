import React from 'react'
import { AiFillHeart } from "react-icons/ai"
import { Skeleton } from "./loaders/SkeletonLoader"
import { Like } from "../types"
// Theme is now handled directly with fixed colors

interface LikeButtonProps {
    hasClickedLike: boolean;
    userLiked: boolean;
    likes: Like[];
    likeOrUnlike: () => void;
    layout?: 'vertical' | 'horizontal';
}

const LikeButton: React.FC<LikeButtonProps> = ({ hasClickedLike, userLiked, likes, likeOrUnlike, layout = 'vertical' }) => {
    // Using fixed colors for dark theme

    return (
        <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center`}>
            <button
                disabled={hasClickedLike}
                onClick={likeOrUnlike}
                className="rounded-full bg-gray-900 p-3 cursor-pointer hover:bg-gray-800"
            >
                {!hasClickedLike ? (
                    <AiFillHeart
                        className={likes?.length > 0 && userLiked ? 'text-[#ff2626]' : 'text-white'}
                        size="22"
                    />
                ) : (
                    <div className="w-[22px] h-[22px] relative">
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full bg-white opacity-70 animate-pulse"></div>
                    </div>
                )}
            </button>
            <span className={`text-xs text-white font-semibold ${layout === 'horizontal' ? 'ml-1' : ''}`}>
                {likes?.length}
            </span>
        </div>
    )
}

export default LikeButton;
