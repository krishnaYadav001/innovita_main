import { useState } from 'react';
import { getDatabases, getStorage, ID } from '@/libs/AppWriteClient'; // Use getter functions
import { Product } from '@/app/types'; // Assuming Product type is defined here
import useCreateBucketUrl from './useCreateBucketUrl'; // To generate the final image URL

const useCreateProduct = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = async (
        name: string,
        price: number, // Expecting price as a number now
        url: string,
        imageFile: File,
        userId?: string // Optional user ID parameter
    ): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);

        // Use NEXT_PUBLIC_BUCKET_ID as confirmed implicitly
        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT || !process.env.NEXT_PUBLIC_BUCKET_ID) {
            setError("Database/Collection/Bucket IDs are not configured correctly in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection/Bucket IDs missing in .env");
            return null;
        }

        try {
            // 1. Upload Image to Storage
            let imageUpload;
            try {
                imageUpload = await getStorage().createFile( // Use getter
                    process.env.NEXT_PUBLIC_BUCKET_ID, // Use the general bucket ID
                    ID.unique(),
                    imageFile
                );
            } catch (uploadError: any) {
                console.error("Error uploading product image:", uploadError);
                if (uploadError.code === 401) {
                    setError("Authorization Error: You don't have permission to upload files. Please check the AppWrite bucket permissions.");
                } else {
                    setError(uploadError.message || "Failed to upload product image.");
                }
                setIsLoading(false);
                return null;
            }

            // 2. Create Product Document in Database
            const productData: any = {
                name: name,
                price: price,
                product_url: url, // Corrected field name
                imageId: imageUpload.$id // Store imageId (removed image_url)
            };

            // Add user_id if provided
            if (userId) {
                productData.user_id = userId;
            }

            let newProduct;
            try {
                newProduct = await getDatabases().createDocument( // Use getter
                    process.env.NEXT_PUBLIC_DATABASE_ID,
                    process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                    ID.unique(),
                    productData
                );
            } catch (dbError: any) {
                console.error("Error creating product document:", dbError);
                if (dbError.code === 401) {
                    setError("Authorization Error: You don't have permission to create product documents. Please check the AppWrite collection permissions.");
                } else {
                    setError(dbError.message || "Failed to create product document.");
                }

                // Try to clean up the uploaded image if possible
                try {
                    await getStorage().deleteFile(process.env.NEXT_PUBLIC_BUCKET_ID!, imageUpload.$id); // Use getter
                    console.log("Cleaned up orphaned image file after product creation failed.");
                } catch (cleanupError) {
                    console.error("Failed to clean up orphaned image:", cleanupError);
                }

                setIsLoading(false);
                return null;
            }

            setIsLoading(false);
            // Assuming the created document structure matches the Product type
            // Appwrite returns the created document, map it if necessary
            return {
                id: newProduct.$id,
                name: newProduct.name,
                price: newProduct.price,
                product_url: newProduct.product_url, // Corrected field name
                image_url: newProduct.image_url, // Keep for now, but prioritize imageId
                imageId: newProduct.imageId, // Added imageId to return object
                user_id: newProduct.user_id || userId, // Include user_id from document or parameter
                // Add other fields from your Product type if they exist in the DB response
            } as Product;

        } catch (err: any) {
            console.error("Error creating product:", err);
            setError(err.message || "An unknown error occurred while creating the product.");
            setIsLoading(false);
            return null;
        }
    };

    return { createProduct, isLoading, error };
};

export default useCreateProduct;