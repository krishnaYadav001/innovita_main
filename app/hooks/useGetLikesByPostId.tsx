import { getDatabases, Query } from "@/libs/AppWriteClient" // Use getter function

const useGetLikesByPostId = async (postId: string) => {
    try {
        const response = await getDatabases().listDocuments( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID), 
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE), 
            [ 
                Query.equal('post_id', postId) 
            ]
        );
        const documents = response.documents;
        const result = documents.map(doc => {
            return { 
                id: doc?.$id, 
                user_id: doc?.user_id,
                post_id: doc?.post_id
            }
        })
        
        return result
    } catch (error) {
        throw error
    }
}

export default useGetLikesByPostId