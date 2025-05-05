"use client"

import { useState, useEffect } from 'react';
import { useUser } from '@/app/context/user';
import useIsFollowing from '@/app/hooks/useIsFollowing';
import useCreateFollow from '@/app/hooks/useCreateFollow';
import useDeleteFollow from '@/app/hooks/useDeleteFollow';
import { useFollowStore } from '@/app/stores/follow';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { BiLoaderCircle } from 'react-icons/bi';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className = '' }: FollowButtonProps) {
  const contextUser = useUser();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const { setFollowers, setFollowing, setFollowCounts } = useFollowStore();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!contextUser?.user || contextUser.isLoadingUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const following = await useIsFollowing(contextUser.user.id, targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [contextUser?.user, contextUser?.isLoadingUser, targetUserId]);

  const handleFollowAction = async () => {
    if (!contextUser?.user || contextUser.isLoadingUser) {
      console.log('User not authenticated or still loading');
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await useDeleteFollow(contextUser.user.id, targetUserId);
        setIsFollowing(false);
      } else {
        // Follow
        await useCreateFollow(contextUser.user.id, targetUserId);
        setIsFollowing(true);
      }

      // Update followers and following lists
      try {
        await setFollowers(targetUserId);
        await setFollowing(contextUser.user.id);
        await setFollowCounts(targetUserId);
      } catch (updateError) {
        console.error('Error updating follow lists:', updateError);
        // Continue even if updating lists fails
      }
    } catch (error) {
      console.error('Error with follow action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (contextUser?.user?.id === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleFollowAction}
      disabled={isLoading || !contextUser?.user}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`${
        isFollowing
          ? isHovering
            ? 'border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-red-500 dark:text-red-400'
            : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white'
          : 'bg-[#F02C56] hover:bg-[#e02a51] text-white'
      } font-medium rounded-md py-1.5 px-3.5 text-sm transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'} ${className} flex items-center justify-center gap-1.5`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Loading...</span>
        </>
      ) : isFollowing ? (
        <>
          {isHovering ? (
            <>
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <FiUserCheck size="16" />
              <span>Following</span>
            </>
          )}
        </>
      ) : (
        <>
          <FiUserPlus size="16" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
