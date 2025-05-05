import { Query, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"

const useIsFollowing = async (followerId: string, followingId: string) => {
  try {
    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, returning false for follow status");
      return false;
    }

    // Get database instance
    const db = await getDatabase();

    // Check if a follow relationship exists
    const response = await db.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
      [
        Query.equal('follower_id', followerId),
        Query.equal('following_id', followingId)
      ]
    );

    // Return true if the relationship exists, false otherwise
    return response.documents.length > 0;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export default useIsFollowing;
