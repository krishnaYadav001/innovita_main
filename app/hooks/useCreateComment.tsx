import { getDatabases, ID } from "@/libs/AppWriteClient" // Use getter function

const useCreateComment = async (userId: string, postId: string, comment: string) => {
    try {
        const newComment = await getDatabases().createDocument(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT),
            ID.unique(),
            {
                user_id: userId,
                post_id: postId,
                text: comment,
                created_at: new Date().toISOString(),
            }
        );
        return newComment; // Return the created document
    } catch (error) {
        throw error;
    }
}

export default useCreateComment