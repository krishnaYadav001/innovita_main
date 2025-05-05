import { Query, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"

const useDeleteFollow = async (followerId: string, followingId: string) => {
  try {
    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, cannot delete follow relationship");
      return false;
    }

    // Get database instance
    const db = await getDatabase();

    // First, find the follow document with the given follower and following IDs
    const response = await db.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
      [
        Query.equal('follower_id', followerId),
        Query.equal('following_id', followingId)
      ]
    );

    // If no follow relationship exists, return
    if (response.documents.length === 0) {
      return false;
    }

    // Delete the follow document
    const followId = response.documents[0].$id;
    await db.deleteDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
      followId
    );

    return true;
  } catch (error) {
    console.error("Error deleting follow:", error);
    return false;
  }
}

export default useDeleteFollow;
