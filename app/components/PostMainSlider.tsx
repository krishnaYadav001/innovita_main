"use client"

import { useState } from "react";
import PostMainLikes from "./PostMainLikes";
import { PostMainCompTypes } from "../types";
import { useUser } from "../context/user";
import PostVideo from "./post/PostVideo";
import ProductInfoModal from "./modals/ProductInfoModal";
import PostHeader from "./post/PostHeader";
import PostCaption from "./post/PostCaption";

export default function PostMainSlider({ post }: PostMainCompTypes) {
    // State for the product info/action modal
    const [showProductModal, setShowProductModal] = useState(false);
    const contextUser = useUser();

    // Determine if the current user is the post creator
    const isCurrentUserPostCreator = contextUser?.user?.id === post?.profile?.user_id;

    return (
        <>
            <div
                id={`PostMain-${post.id}`}
                className="flex flex-col w-full max-w-[600px] mx-auto px-0 py-0"
            >
                <div className="w-full flex flex-row">
                    {/* Center - Video */}
                    <div className="w-full flex justify-center items-center">
                        <div className="relative flex">
                            <PostVideo
                                post={post}
                                isCurrentUserPostCreator={isCurrentUserPostCreator}
                                onShopClick={() => setShowProductModal(true)}
                            />

                            {/* Bottom right action buttons */}
                            <div className="absolute right-4 bottom-[15%] z-30">
                                <PostMainLikes post={post} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom - Info */}
                <div className="w-full px-4 py-2 mt-2 bg-black dark:bg-black text-white">
                    <PostHeader profile={post.profile} />
                    <PostCaption text={post.text} />
                </div>
            </div>

            {/* Render the extracted Product Info Modal */}
            <ProductInfoModal
                postId={post.id}
                primaryProductId={post.primary_product_id}
                isCurrentUserPostCreator={isCurrentUserPostCreator}
                isVisible={showProductModal}
                onClose={() => setShowProductModal(false)}
            />
        </>
    );
}
