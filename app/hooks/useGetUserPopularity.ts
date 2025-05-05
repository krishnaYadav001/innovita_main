import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import { PostWithProfile } from "@/app/types";
import { getUserLikesCount } from './useGetUsersByPopularity'; // Import the function

// Function to sort posts by user popularity
export const sortPostsByUserPopularity = async (posts: PostWithProfile[]): Promise<PostWithProfile[]> => {
  try {
    // Create a map to store user_id -> likes count
    const userLikesMap = new Map<string, number>();

    // Get unique user IDs from posts
    const userIds = Array.from(new Set(posts.map(post => post.user_id)));

    // Get likes count for each user
    for (const userId of userIds) {
      const likesCount = await getUserLikesCount(userId);
      userLikesMap.set(userId, likesCount);
    }

    // Sort posts by user popularity (likes count)
    const sortedPosts = [...posts].sort((a, b) => {
      const aLikes = userLikesMap.get(a.user_id) || 0;
      const bLikes = userLikesMap.get(b.user_id) || 0;
      return bLikes - aLikes; // Sort in descending order
    });

    return sortedPosts;
  } catch (error) {
    console.error("Error sorting posts by user popularity:", error);
    return posts; // Return original posts if error
  }
};

export default sortPostsByUserPopularity;
