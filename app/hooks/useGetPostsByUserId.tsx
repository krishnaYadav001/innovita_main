import { getDatabases, Query } from "@/libs/AppWriteClient" // Use getter function

const useGetPostsByUser = async (userId: string) => {
    try {
        const response = await getDatabases().listDocuments( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID), 
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST), 
            [
                Query.equal('user_id', userId),
                Query.orderDesc("$id")
            ]
        );
        const documents = response.documents;
        const result = documents.map(doc => {
            return {
                $id: doc?.$id, // Add the required $id property
                id: doc?.$id,
                user_id: doc?.user_id,
                video_url: doc?.video_url,
                text: doc?.text,
                created_at: doc?.created_at,
                primary_product_id: doc?.primary_product_id, // Added this line
            }
        })
        
        return result
    } catch (error) {
        throw error
    }
}

export default useGetPostsByUser