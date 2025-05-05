import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import { User } from "./useGetAllUsers";

// Function to get all likes for a specific user's posts
export const getUserLikesCount = async (userId: string): Promise<number> => {
  try {
    // First, get all posts by this user
    const postsResponse = await getDatabases().listDocuments( // Use getter
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
      const likesResponse = await getDatabases().listDocuments( // Use getter
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

// Function to get popular users
export const getPopularUsers = async (limit?: number): Promise<User[]> => {
  try {
    // Fetch all profiles from the database
    const response = await getDatabases().listDocuments( // Use getter
      String(process.env.NEXT_PUBLIC_DATABASE_ID), 
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE)
    );
    
    const documents = response.documents;
    
    // Map the documents to our User interface
    const users = documents.map(doc => ({
      id: doc.$id,
      user_id: doc.user_id,
      name: doc.name,
      image: doc.image,
      bio: doc.bio || '',
      createdAt: doc.$createdAt
    }));
    
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
    
    // Return all users or limit if specified
    return limit ? sortedUsers.slice(0, limit) : sortedUsers;
  } catch (error) {
    console.error("Error getting popular users:", error);
    return [];
  }
};

export default getPopularUsers;
