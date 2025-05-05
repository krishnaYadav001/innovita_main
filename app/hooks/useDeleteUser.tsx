"use client";

import { useState } from 'react';
import { getDatabases, getStorage, getAccount, Query } from "@/libs/AppWriteClient"; // Use getter functions
import useDeletePostById from './useDeletePostById';
import useDeleteFollow from './useDeleteFollow';
import useDeleteLike from './useDeleteLike';
import useDeleteComment from './useDeleteComment';
import { useGeneralStore } from "@/app/stores/general";

/**
 * Hook for deleting a user and all their associated content
 */
const useDeleteUser = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Get the post deletion hook
    const { deletePostAndProduct } = useDeletePostById();

    /**
     * Delete a user and all their associated content
     * @param userId The ID of the user to delete
     */
    const deleteUser = async (userId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        // Get the store functions to refresh sidebar data
        const generalStore = useGeneralStore.getState();

        try {
            console.log(`Starting deletion process for user ${userId}`);

            // 1. Get the user's profile
            const profileResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
                [Query.equal('user_id', userId)]
            );

            if (profileResponse.documents.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profile = profileResponse.documents[0];
            const profileId = profile.$id;
            const profileImage = profile.image;

            console.log(`Found profile ${profileId} for user ${userId}`);

            // 2. Get all posts by the user
            const postsResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                [Query.equal('user_id', userId)]
            );

            const posts = postsResponse.documents;
            console.log(`Found ${posts.length} posts for user ${userId}`);

            // 3. Delete each post and its associated content
            for (const post of posts) {
                try {
                    await deletePostAndProduct(post.$id, post.video_url);
                    console.log(`Deleted post ${post.$id} for user ${userId}`);
                } catch (postError) {
                    console.error(`Error deleting post ${post.$id}:`, postError);
                    // Continue with other posts
                }
            }

            // 4. Delete all follows where the user is the follower or following
            // Get follows where user is follower
            const followerResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
                [Query.equal('follower_id', userId)]
            );

            // Delete follows where user is follower
            for (const follow of followerResponse.documents) {
                try {
                    await useDeleteFollow(userId, follow.following_id);
                    console.log(`Deleted follow relationship where user ${userId} follows ${follow.following_id}`);
                } catch (followError) {
                    console.error(`Error deleting follow relationship:`, followError);
                    // Continue with other follows
                }
            }

            // Get follows where user is following
            const followingResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
                [Query.equal('following_id', userId)]
            );

            // Delete follows where user is following
            for (const follow of followingResponse.documents) {
                try {
                    await useDeleteFollow(follow.follower_id, userId);
                    console.log(`Deleted follow relationship where user ${follow.follower_id} follows ${userId}`);
                } catch (followError) {
                    console.error(`Error deleting follow relationship:`, followError);
                    // Continue with other follows
                }
            }

            // 5. Delete all likes by the user
            const likesResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
                [Query.equal('user_id', userId)]
            );

            for (const like of likesResponse.documents) {
                try {
                    await useDeleteLike(like.$id);
                    console.log(`Deleted like ${like.$id} by user ${userId}`);
                } catch (likeError) {
                    console.error(`Error deleting like ${like.$id}:`, likeError);
                    // Continue with other likes
                }
            }

            // 6. Delete all comments by the user
            const commentsResponse = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT),
                [Query.equal('user_id', userId)]
            );

            for (const comment of commentsResponse.documents) {
                try {
                    await useDeleteComment(comment.$id);
                    console.log(`Deleted comment ${comment.$id} by user ${userId}`);
                } catch (commentError) {
                    console.error(`Error deleting comment ${comment.$id}:`, commentError);
                    // Continue with other comments
                }
            }

            // 7. Delete the profile image if it's not the default
            if (profileImage && profileImage !== String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID)) {
                try {
                    await getStorage().deleteFile(
                        String(process.env.NEXT_PUBLIC_BUCKET_ID),
                        profileImage
                    );
                    console.log(`Deleted profile image ${profileImage} for user ${userId}`);
                } catch (imageError) {
                    console.error(`Error deleting profile image ${profileImage}:`, imageError);
                    // Continue with deletion process
                }
            }

            // 8. Delete the profile
            await getDatabases().deleteDocument(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
                profileId
            );
            console.log(`Deleted profile ${profileId} for user ${userId}`);

            // 9. Trigger backend API to delete the user account
            try {
                console.log(`Calling backend API to delete user account ${userId}`);
                const response = await fetch('/api/admin/delete-user', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `API call failed with status ${response.status}`);
                }

                console.log(`Successfully triggered backend deletion for user account ${userId}`);
            } catch (apiError) {
                console.error(`Error calling backend API to delete user account ${userId}:`, apiError);
                // Log the error but continue, as content deletion was successful.
                // The backend should handle its own errors.
                // Optionally, you could set a specific error state here if needed.
            }

            // 10. Refresh sidebar data to remove the deleted user
            try {
                console.log('Refreshing sidebar data after user deletion');
                generalStore.setRandomUsers();
                generalStore.setPopularUsers();

                // If there's a logged-in user, refresh their following list
                if (generalStore.followingUsers.length > 0) {
                    const currentUserId = localStorage.getItem('userId');
                    if (currentUserId) {
                        generalStore.setFollowingUsers(currentUserId);
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing sidebar data:', refreshError);
                // Continue with success even if refresh fails
            }

            setIsSuccess(true);
            console.log(`Successfully completed deletion process for user ${userId}`);
            return true;
        } catch (error: any) {
            console.error(`Error in deleteUser for ${userId}:`, error);
            setError(error.message || `An error occurred while deleting user ${userId}`);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteUser, isLoading, error, isSuccess };
};

export default useDeleteUser;
