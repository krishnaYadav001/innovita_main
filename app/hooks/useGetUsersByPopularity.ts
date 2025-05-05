import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import { User } from "./useGetAllUsers";

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
      const likesResponse = await getDatabases().listDocuments( // Fixed typo: use getDatabases()
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

// Function to sort users by popularity (total likes received)
export const sortUsersByPopularity = async (users: User[]): Promise<User[]> => {
  try {
    // Create a map to store user_id -> likes count
    const userLikesMap = new Map<string, number>();

    // Get likes count for each user
    for (const user of users) {
      const likesCount = await getUserLikesCount(user.user_id);
      userLikesMap.set(user.user_id, likesCount);
    }

    // Sort users by popularity (likes count)
    const sortedUsers = [...users].sort((a, b) => {
      const aLikes = userLikesMap.get(a.user_id) || 0;
      const bLikes = userLikesMap.get(b.user_id) || 0;
      return bLikes - aLikes; // Sort in descending order (most likes first)
    });

    return sortedUsers;
  } catch (error) {
    console.error("Error sorting users by popularity:", error);
    return users; // Return original users if error
  }
};

export default sortUsersByPopularity;
