"use client"

import { AiFillHeart } from "react-icons/ai";
import { ImMusic } from "react-icons/im";
import { BsShop } from "react-icons/bs"; // Changed icon
import { BiLoaderCircle } from 'react-icons/bi'; // For loading state
import Link from "next/link";
import { useEffect, useState } from "react";
import PostActionButtons from "./post/PostActionButtons"; // Import the correct component
import useCreateBucketUrl from "../hooks/useCreateBucketUrl";
import { PostMainCompTypes, Product } from "../types"; // Added Product type
import { useUser } from "../context/user"; // Import user context
// Removed unused product-related hooks and modals from here
import PostVideo from "./post/PostVideo"; // Import the new PostVideo component
import ProductInfoModal from "./modals/ProductInfoModal"; // Import the extracted modal
import PostHeader from "./post/PostHeader"; // Import the new PostHeader component
import PostCaption from "./post/PostCaption"; // Import the new PostCaption component

export default function PostMain({ post }: PostMainCompTypes) {
    // State for the product info/action modal
    const [showProductModal, setShowProductModal] = useState(false);
    const contextUser = useUser();

    // Determine if the current user is the post creator (still needed for PostVideo)
    const isCurrentUserPostCreator = contextUser?.user?.id === post?.profile?.user_id;

    // Removed product fetching hooks, state, and modal visibility state - moved to ProductInfoModal

    // Removed IntersectionObserver useEffect - logic moved to PostVideo component
    // --- Action Handlers ---
    // Removed action handlers (handleDeleteProduct, handleOpenAddModal, handleOpenEditModal) - moved to ProductInfoModal

    // --- Render ---
    return (
        <>
            <div id={`PostMain-${post.id}`} className="flex flex-col md:flex-row items-start border-b dark:border-gray-800 py-4 md:py-6 w-full">

                {/* Post Content */}
                {/* Top section (mobile) / Left side (desktop) - Profile info and captions */}
                <div className="w-full md:w-1/3 px-3 md:px-4 mb-3 md:mb-0">
                    {/* Use the extracted PostHeader component */}
                    <PostHeader profile={post.profile} />

                    {/* Use the extracted PostCaption component */}
                    <PostCaption text={post.text} />
                </div>

                {/* Bottom section (mobile) / Right side (desktop) - Video and actions */}
                <div className="w-full md:w-2/3 flex justify-center md:justify-start">
                    {/* Container for Video and Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-3 md:gap-4 w-full md:w-auto">
                        {/* PostVideo component */}
                        <PostVideo
                            post={post}
                            isCurrentUserPostCreator={isCurrentUserPostCreator}
                            onShopClick={() => setShowProductModal(true)}
                        />

                        {/* Action Buttons Component - horizontal on mobile, vertical on desktop */}
                        <div className="md:hidden flex justify-center w-full bg-black bg-opacity-70 py-3 px-4 rounded-lg mt-2">
                            <PostActionButtons post={post} layout="horizontal" />
                        </div>
                        <div className="hidden md:block">
                            <PostActionButtons post={post} layout="vertical" />
                        </div>
                    </div>
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
