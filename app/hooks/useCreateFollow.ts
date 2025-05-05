import { ID, getDatabase, isAuthenticated } from "@/libs/AppWriteClient"

const useCreateFollow = async (followerId: string, followingId: string) => {
  try {
    // Check if user is authenticated
    const auth = await isAuthenticated();
    if (!auth) {
      console.log("User not authenticated, cannot create follow relationship");
      return false;
    }

    // Get database instance
    const db = await getDatabase();

    // Create a follow relationship in the database
    await db.createDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW),
      ID.unique(),
      {
        follower_id: followerId, // The user who is following
        following_id: followingId, // The user being followed
        created_at: new Date().toISOString()
      }
    );

    return true;
  } catch (error) {
    console.error("Error creating follow:", error);
    return false;
  }
}

export default useCreateFollow;
