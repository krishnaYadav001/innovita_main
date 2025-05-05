import { useState } from 'react';
import { getDatabases, getStorage } from '@/libs/AppWriteClient'; // Use getter functions
import { Product } from '@/app/types'; // Import Product type for return type hint
import useCreateBucketUrl from './useCreateBucketUrl'; // To potentially update image URL if image changes

// Define the shape of the data we expect to update
// Making fields optional allows updating only specific ones
interface UpdateProductData {
    name?: string;
    price?: number;
    product_url?: string;
    imageFile?: File | null; // Allow updating the image
    currentImageId?: string | null; // Needed if replacing image to delete old one
}

const useUpdateProduct = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const updateProduct = async (productId: string, data: UpdateProductData): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT || !process.env.NEXT_PUBLIC_BUCKET_ID) {
            setError("Database/Collection/Bucket IDs are not configured in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection/Bucket IDs missing in .env");
            return null;
        }

        // Ensure we are actually trying to update something
        if (Object.keys(data).length === 0) {
             setError("No update data provided.");
             setIsLoading(false);
             return null;
        }

        try {
            let imageUrl: string | undefined = undefined;
            let imageId: string | undefined = undefined;
            let oldImageIdToDelete: string | null = null;

            // 1. Handle Image Update (if provided)
            if (data.imageFile) {
                console.log(`Uploading new image for product ${productId}`);
                // Store the old image ID for deletion after successful upload
                oldImageIdToDelete = data.currentImageId || null;

                const newImageUpload = await getStorage().createFile( // Use getter
                    process.env.NEXT_PUBLIC_BUCKET_ID,
                    'unique()', // Appwrite generates unique ID
                    data.imageFile
                );
                imageUrl = useCreateBucketUrl(newImageUpload.$id);
                imageId = newImageUpload.$id;
                console.log(`New image uploaded, ID: ${imageId}, URL: ${imageUrl}`);
            }

            // 2. Prepare Data for Database Update
            const dbUpdateData: { [key: string]: any } = {};
            if (data.name !== undefined) dbUpdateData.name = data.name;
            if (data.price !== undefined) dbUpdateData.price = data.price;
            if (data.product_url !== undefined) dbUpdateData.product_url = data.product_url;
            // Removed saving static image_url, only save imageId
            if (imageId !== undefined) dbUpdateData.imageId = imageId; // Update imageId if new image uploaded

            // Ensure we have something to update in the DB
            if (Object.keys(dbUpdateData).length === 0) {
                 console.log("No database fields to update for product", productId);
                 // If only image was 'updated' but no DB fields changed, consider it success?
                 // Or maybe return the existing product data? For now, let's proceed as success.
                 setIsSuccess(true);
                 setIsLoading(false);
                 // We need to fetch the current product data to return it here if needed.
                 // For simplicity now, returning null, but ideally fetch current data.
                 return null; // Or fetch and return current product
            }


            // 3. Update Product Document
            console.log(`Updating product document ${productId} with data:`, dbUpdateData);
            const updatedDoc = await getDatabases().updateDocument( // Use getter
                process.env.NEXT_PUBLIC_DATABASE_ID,
                process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                productId,
                dbUpdateData
            );
            console.log(`Product document ${productId} updated successfully.`);

            // 4. Delete Old Image (if new one was uploaded successfully)
            if (oldImageIdToDelete) {
                try {
                    console.log(`Deleting old image ${oldImageIdToDelete}`);
                    await getStorage().deleteFile(process.env.NEXT_PUBLIC_BUCKET_ID, oldImageIdToDelete); // Use getter
                    console.log(`Old image ${oldImageIdToDelete} deleted.`);
                } catch (deleteError: any) {
                    // Log error but don't fail the whole update process
                    console.error(`Failed to delete old image ${oldImageIdToDelete}:`, deleteError);
                    // Optionally: Add this error to a list of non-critical errors
                }
            }

            setIsSuccess(true);
            setIsLoading(false);

            // Map updated document back to Product type
            return {
                id: updatedDoc.$id,
                name: updatedDoc.name,
                price: updatedDoc.price,
                product_url: updatedDoc.product_url,
                image_url: updatedDoc.image_url, // Keep for now, but prioritize imageId
                imageId: updatedDoc.imageId, // Added imageId to return object
            } as Product;


        } catch (err: any) {
            console.error(`Error updating product ${productId}:`, err);
            setError(err.message || `An unknown error occurred while updating product ${productId}.`);
            setIsLoading(false);
            setIsSuccess(false);
            return null;
        }
    };

    return { updateProduct, isLoading, error, isSuccess };
};

export default useUpdateProduct;