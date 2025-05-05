import { Query, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"
import useGetProfileByUserId from "./useGetProfileByUserId";
import { RandomUsers } from "@/app/types";
import useGetRandomUsers from "./useGetRandomUsers";

const useGetFollowingForSidebar = async (userId: string, limit: number = 5): Promise<RandomUsers[]> => {
  try {
    // Check if the FOLLOW collection ID is defined
    if (!process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW) {
      console.log("Follow collection ID not defined, returning random users instead");
      return await useGetRandomUsers(limit);
    }

    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, returning random users instead");
      return await useGetRandomUsers(limit);
    }

    try {
      // Get database instance
      const db = await getDatabase();

      // Get users that the current user follows
      const response = await db.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
        [
          Query.equal('follower_id', userId),
          Query.orderDesc('created_at'),
          Query.limit(limit)
        ]
      );

      const documents = response.documents;

      // For each following, get their profile information
      const followingUsers = await Promise.all(
        documents.map(async (doc) => {
          const profile = await useGetProfileByUserId(doc.following_id);

          return {
            id: profile?.user_id || '',
            name: profile?.name || '',
            image: profile?.image || '',
          };
        })
      );

      return followingUsers;
    } catch (error: any) {
      // If the collection doesn't exist or there's another error, return random users instead
      if (error.message && error.message.includes("Collection with the requested ID could not be found")) {
        console.log("Follow collection not found, returning random users instead");
        return await useGetRandomUsers(limit);
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Error getting following for sidebar:", error);
    return [];
  }
}

export default useGetFollowingForSidebar;
