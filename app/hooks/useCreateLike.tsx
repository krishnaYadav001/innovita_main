import { getDatabases, ID } from "@/libs/AppWriteClient" // Use getter function

const useCreateLike = async (userId: string, postId: string) => {
    try {
        await getDatabases().createDocument( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID), 
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE), 
            ID.unique(), 
        {
            user_id: userId,
            post_id: postId,
        });
    } catch (error) {
        throw error
    }
}

export default useCreateLike