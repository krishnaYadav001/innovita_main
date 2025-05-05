import { getDatabases } from "@/libs/AppWriteClient" // Use getter function

const useGetRichTextByPostId = async (postId: string): Promise<any> => {
    try {
        const response = await getDatabases().listDocuments( // Use getter
            String(process.env.NEXT_PUBLIC_DATABASE_ID), 
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_RICH_TEXT_EDITOR),
            [
                `equal("post_id", ["${postId}"])`,
                `orderDesc("$createdAt")`
            ]
        );

        if (response.documents.length > 0 && response.documents[0].text) { // Change 'content' to 'text'
            return JSON.parse(response.documents[0].text); // Change 'content' to 'text'
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching rich text content:", error);
        throw error;
    }
}

export default useGetRichTextByPostId;