import { Query, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"
import useGetProfileByUserId from "./useGetProfileByUserId";

export interface Following {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile: {
    user_id: string;
    name: string;
    image: string;
  };
}

const useGetFollowing = async (userId: string) => {
  try {
    // Check if the FOLLOW collection ID is defined
    if (!process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW) {
      console.log("Follow collection ID not defined, returning empty array");
      return [];
    }

    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, returning empty array");
      return [];
    }

    try {
      // Get database instance
      const db = await getDatabase();

      // Get all users that the given user follows
      const response = await db.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
        [
          Query.equal('follower_id', userId),
          Query.orderDesc('created_at')
        ]
      );

      const documents = response.documents;

      // For each following, get their profile information
      const followingWithProfiles = await Promise.all(
        documents.map(async (doc) => {
          const profile = await useGetProfileByUserId(doc.following_id);

          return {
            id: doc.$id,
            follower_id: doc.follower_id,
            following_id: doc.following_id,
            created_at: doc.created_at,
            profile: {
              user_id: profile?.user_id,
              name: profile?.name,
              image: profile?.image,
            }
          };
        })
      );

      return followingWithProfiles;
    } catch (error: any) {
      // If the collection doesn't exist, return an empty array
      if (error.message && error.message.includes("Collection with the requested ID could not be found")) {
        console.log("Follow collection not found, returning empty array");
        return [];
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Error getting following:", error);
    return [];
  }
}

export default useGetFollowing;
