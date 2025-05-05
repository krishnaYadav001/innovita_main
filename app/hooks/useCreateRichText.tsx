import { getDatabases, ID } from "@/libs/AppWriteClient" // Use getter function

const useCreateRichText = async (userId: string, postId: string, content: any) => {
    try {
        console.log("Creating rich text with userId:", userId, "postId:", postId, "content:", content);
        const sanitizedContent = JSON.stringify(content);
        if (!sanitizedContent) {
            throw new Error("Content cannot be empty");
        }

        const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID;
        const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_RICH_TEXT_EDITOR;

        if (!databaseId || !collectionId) {
            throw new Error("Environment variables for database or collection ID are not set");
        }

        const response = await getDatabases().createDocument( // Use getter
            String(databaseId), 
            String(collectionId),
            ID.unique(), 
            {
                user_id: userId,
                post_id: postId,
                text: sanitizedContent,
                created_at: new Date().toISOString(),
            }
        );
        
        console.log("Rich text created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error creating rich text:", error);
        throw error;
    }
}

export default useCreateRichText;