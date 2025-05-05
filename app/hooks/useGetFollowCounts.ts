import { Query, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"

export interface FollowCounts {
  followers: number;
  following: number;
}

const useGetFollowCounts = async (userId: string): Promise<FollowCounts> => {
  try {
    // Check if the FOLLOW collection ID is defined
    if (!process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW) {
      console.log("Follow collection ID not defined, returning zero counts");
      return {
        followers: 0,
        following: 0
      };
    }

    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, returning zero counts");
      return {
        followers: 0,
        following: 0
      };
    }

    try {
      // Get database instance
      const db = await getDatabase();

      // Get followers count
      const followersResponse = await db.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
        [Query.equal('following_id', userId)]
      );

      // Get following count
      const followingResponse = await db.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
        [Query.equal('follower_id', userId)]
      );

      return {
        followers: followersResponse.total,
        following: followingResponse.total
      };
    } catch (error: any) {
      // If the collection doesn't exist, return zero counts
      if (error.message && error.message.includes("Collection with the requested ID could not be found")) {
        console.log("Follow collection not found, returning zero counts");
        return {
          followers: 0,
          following: 0
        };
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error("Error getting follow counts:", error);
    return {
      followers: 0,
      following: 0
    };
  }
}

export default useGetFollowCounts;
