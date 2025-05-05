import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import { PostWithProfile } from "@/app/types";

// Function to get all likes for a specific user's posts
export const getUserLikesCount = async (userId: string): Promise<number> => {
  try {
    // First, get all posts by this user
    const postsResponse = await getDatabases().listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
      [Query.equal('user_id', userId)]
    );

    const posts = postsResponse.documents;

    // If no posts, return 0 likes
    if (posts.length === 0) return 0;

    // Get post IDs
    const postIds = posts.map(post => post.$id);

    // For each post, get the likes count
    let totalLikes = 0;

    // We need to query for each post ID separately since Appwrite doesn't support OR queries directly
    for (const postId of postIds) {
      const likesResponse = await getDatabases().listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
        [Query.equal('post_id', postId)]
      );

      totalLikes += likesResponse.documents.length;
    }

    return totalLikes;
  } catch (error) {
    console.error("Error getting user likes count:", error);
    return 0;
  }
};

// Function to sort posts by user popularity
export const sortPostsByUserPopularity = async (posts: PostWithProfile[]): Promise<PostWithProfile[]> => {
  try {
    // Create a map to store user_id -> likes count
    const userLikesMap = new Map<string, number>();

    // Get unique user IDs from posts
    const userIds = [...new Set(posts.map(post => post.user_id))];

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
