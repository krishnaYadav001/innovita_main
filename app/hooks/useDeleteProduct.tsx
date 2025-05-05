import { useState } from 'react';
import { getDatabases, getStorage } from '@/libs/AppWriteClient'; // Use getter functions

const useDeleteProduct = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // We need the imageId associated with the product to delete it from storage
    const deleteProduct = async (productId: string, imageId: string | null | undefined): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT || !process.env.NEXT_PUBLIC_BUCKET_ID) {
            setError("Database/Collection/Bucket IDs are not configured in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection/Bucket IDs missing in .env");
            return false;
        }

        try {
            // 1. Delete Product Document
            console.log(`Deleting product document ${productId}`);
            await getDatabases().deleteDocument( // Use getter
                process.env.NEXT_PUBLIC_DATABASE_ID,
                process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                productId
            );
            console.log(`Product document ${productId} deleted successfully.`);

            // 2. Delete Associated Image from Storage (if imageId is provided)
            if (imageId) {
                try {
                    console.log(`Deleting image ${imageId} from bucket ${process.env.NEXT_PUBLIC_BUCKET_ID}`);
                    await getStorage().deleteFile(process.env.NEXT_PUBLIC_BUCKET_ID, imageId); // Use getter
                    console.log(`Image ${imageId} deleted successfully.`);
                } catch (storageError: any) {
                    // Log the error but consider the main deletion successful if the document was deleted
                    console.error(`Failed to delete image ${imageId} for product ${productId}:`, storageError);
                    setError(`Product document deleted, but failed to delete image: ${storageError.message}`);
                    // Still return true as the primary resource (document) is gone
                }
            } else {
                console.warn(`No imageId provided for product ${productId}, skipping image deletion.`);
            }

            setIsSuccess(true);
            setIsLoading(false);
            return true;

        } catch (err: any) {
            console.error(`Error deleting product ${productId}:`, err);
            setError(err.message || `An unknown error occurred while deleting product ${productId}.`);
            setIsLoading(false);
            setIsSuccess(false);
            return false;
        }
    };

    // We might need a way to get the imageId before calling delete.
    // This hook assumes the caller provides it.
    // Alternatively, fetch the document first inside the hook to get imageId.

    return { deleteProduct, isLoading, error, isSuccess };
};

export default useDeleteProduct;