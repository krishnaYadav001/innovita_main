import { useState } from 'react';
import { getDatabases } from '@/libs/AppWriteClient'; // Use getter function

// Define the shape of the data we expect to update
// Making fields optional allows updating only specific ones
interface UpdatePostData {
    primary_product_id?: string | null;
    // Add other fields here if needed for future updates, e.g., text?: string;
}

const useUpdatePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const updatePost = async (postId: string, data: UpdatePostData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_POST) {
            setError("Database/Collection IDs are not configured in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection IDs missing in .env");
            return false;
        }

        // Ensure we are actually trying to update something
        if (Object.keys(data).length === 0) {
             setError("No update data provided.");
             setIsLoading(false);
             return false;
        }

        try {
            console.log(`Updating post ${postId} with data:`, data);
            await getDatabases().updateDocument( // Use getter
                process.env.NEXT_PUBLIC_DATABASE_ID,
                process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
                postId,
                data // Pass the partial data object
            );
            console.log(`Post ${postId} updated successfully.`);
            setIsSuccess(true);
            setIsLoading(false);
            return true;

        } catch (err: any) {
            console.error(`Error updating post ${postId}:`, err);
            setError(err.message || `An unknown error occurred while updating post ${postId}.`);
            setIsLoading(false);
            setIsSuccess(false);
            return false;
        }
    };

    return { updatePost, isLoading, error, isSuccess };
};

export default useUpdatePost;