"use client";

import React from 'react';
import Link from 'next/link';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import FollowButton from '@/app/components/FollowButton';
import { useUser } from '@/app/context/user';

// Define the simpler profile structure expected from PostMain
interface PostHeaderProps {
    profile: {
        user_id: string;
        name: string;
        image: string;
    };
}

const PostHeader: React.FC<PostHeaderProps> = ({ profile }) => {
    const contextUser = useUser();
    return (
        <div className="flex items-center justify-between pb-3 mb-2">
            <div className="flex items-center">
                {/* User Avatar */}
                <div className="cursor-pointer mr-3"> {/* Added margin-right */}
                    <Link href={`/profile/${profile.user_id}`}>
                        <img
                            className="rounded-full max-h-[48px]" // Slightly smaller avatar?
                            width="48"
                            src={useCreateBucketUrl(profile?.image)}
                            alt={`${profile.name}'s profile`}
                            onError={(e) => {
                                // Prevent infinite loops by using a local fallback
                                e.currentTarget.onerror = null; // Remove the error handler
                                e.currentTarget.src = '/images/placeholder-user.png';
                            }}
                        />
                    </Link>
                </div>
                {/* User Name */}
                <Link href={`/profile/${profile.user_id}`}>
                    {/* Added dark mode text color */}
                    <span className="font-bold hover:underline cursor-pointer text-black dark:text-white">
                        {profile.name}
                    </span>
                </Link>
            </div>

            {/* Use the FollowButton component for proper follow functionality */}
            {contextUser?.user?.id !== profile.user_id && (
                <FollowButton targetUserId={profile.user_id} className="px-[21px] py-0.5" />
            )}
        </div>
    );
};

export default PostHeader;