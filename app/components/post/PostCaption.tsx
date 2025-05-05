"use client";

import React from 'react';
import { AiFillHeart } from "react-icons/ai";
import { ImMusic } from "react-icons/im";

interface PostCaptionProps {
    text: string;
    // Potentially add props for tags and original sound if they become dynamic
}

const PostCaption: React.FC<PostCaptionProps> = ({ text }) => {
    return (
        <>
            {/* Caption */}
            {/* Added dark mode text */}
            <p className="text-[15px] pb-0.5 break-words text-left text-black dark:text-white max-w-[600px] font-normal">{text}</p>
            {/* Meta Tags (Hardcoded for now) */}
            {/* Added dark mode text */}
            <p className="text-[14px] text-gray-500 dark:text-gray-400 pb-0.5 pt-1 text-left">#fun #cool #SuperAwesome</p>
            {/* Original Sound (Hardcoded for now) */}
            {/* Added dark mode text and icon color */}
            <p className="text-[14px] pb-0.5 flex items-center justify-start font-semibold text-black dark:text-white">
                <ImMusic size="17" className="mr-1"/> {/* Added margin */}
                <span className="px-1">original sound - AWESOME</span>
                <AiFillHeart size="20" className="ml-1 text-red-500"/> {/* Added margin and color */}
            </p>
        </>
    );
};

export default PostCaption;