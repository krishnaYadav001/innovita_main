"use client";

import ClientOnly from '../ClientOnly'; // Import ClientOnly

import React, { useEffect, useRef } from 'react';
import { PostWithProfile } from '@/app/types';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import { BsShop } from 'react-icons/bs';
import Tooltip from '../Tooltip';

interface PostVideoProps {
    post: PostWithProfile;
    isCurrentUserPostCreator: boolean;
    onShopClick: () => void; // Callback to open the product modal
}

const PostVideo: React.FC<PostVideoProps> = ({ post, isCurrentUserPostCreator, onShopClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const postMainElementRef = useRef<HTMLDivElement | null>(null); // Ref for the parent container

    // Effect for intersection observer (auto-play/pause)
    useEffect(() => {
        const video = videoRef.current;
        // Get parent element ref for observer
        postMainElementRef.current = document.getElementById(`PostMain-${post.id}`) as HTMLDivElement;
        const postMainElement = postMainElementRef.current;

        if (postMainElement && video) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // Add a small delay to ensure smooth transition
                    setTimeout(() => {
                        video.play().catch(error => {
                            if (error.name !== 'AbortError') {
                                console.error("Video play error:", error);
                            }
                        });
                    }, 100);
                } else {
                    if (!video.paused) {
                        video.pause();
                    }
                }
            }, { threshold: [0.5] }); // Lower threshold for earlier detection

            observer.observe(postMainElement);

            return () => {
                // Check if element still exists before unobserving
                if (postMainElementRef.current) {
                   observer.unobserve(postMainElementRef.current);
                }
            };
        }

        // Cleanup function to ensure video is paused when component unmounts
        return () => {
            if (video && !video.paused) {
                video.pause();
            }
        };
    }, [post.id]); // Depend on post.id

    return (
        <div className="relative min-h-[350px] sm:min-h-[400px] md:min-h-[480px] max-h-[450px] sm:max-h-[500px] md:max-h-[580px] w-full sm:w-[270px] md:w-[300px] flex items-center justify-center bg-black dark:bg-black rounded-md overflow-hidden">
            <video
                ref={videoRef}
                id={`video-${post.id}`}
                loop
                controls
                playsInline
                preload="metadata" // Changed to metadata for faster initial load on mobile
                className="object-contain sm:object-cover mx-auto h-full w-full bg-black dark:bg-black"
                src={useCreateBucketUrl(post?.video_url)}
            />
            <img
                className="absolute right-2 bottom-10 max-w-[70px] sm:max-w-[90px] h-auto object-contain"
                src="/images/ii.png"
                alt="Logo overlay"
            />

            {/* Shop Button - Improved for mobile */}
            <ClientOnly>
                {(isCurrentUserPostCreator || post.primary_product_id) && (
                    <Tooltip text="Shop Product" position="left">
                        <button
                            onClick={onShopClick}
                            className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-2 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 rounded-full hover:bg-opacity-100 dark:hover:bg-opacity-100 transition shadow-md"
                            aria-label="Shop linked product"
                        >
                            <BsShop size={18} className="text-black dark:text-white"/>
                        </button>
                    </Tooltip>
                )}
            </ClientOnly>
        </div>
    );
};

export default PostVideo;