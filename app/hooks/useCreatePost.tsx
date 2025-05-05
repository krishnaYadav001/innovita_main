import { useState } from 'react';
import { getDatabases, getStorage, ID } from "@/libs/AppWriteClient"; // Use getter functions
import useCreateProduct from "./useCreateProduct"; // Import useCreateProduct hook

// Define structure for optional new product details
interface NewProductDetails {
    name: string;
    price: number;
    url: string;
    imageFile: File;
}

// Now define it as a proper custom hook
const useCreatePost = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Call useCreateProduct hook at the top level of our custom hook
    const { createProduct, isLoading: isCreatingProduct, error: createProductError } = useCreateProduct();

    // Define the actual function to perform the creation logic
    const createPostWithProduct = async (
        videoFile: File,
        userId: string,
        caption: string,
        newProductDetails?: NewProductDetails // Make product details optional
    ) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        let videoId = Math.random().toString(36).slice(2, 22);
        let primaryProductId: string | null = null;

        try {
            // 1. Create Product if details are provided
            if (newProductDetails) {
                console.log("Attempting to create product with details:", newProductDetails);
                try {
                    // Use the createProduct function obtained from the hook call above
                    const newProduct = await createProduct(
                        newProductDetails.name,
                        newProductDetails.price,
                        newProductDetails.url,
                        newProductDetails.imageFile
                    );

                    if (newProduct && newProduct.id) {
                        primaryProductId = newProduct.id;
                        console.log("Product created successfully, ID:", primaryProductId);
                    } else {
                        console.error("Failed to create product alongside post.", createProductError);
                        // Instead of throwing an error, we'll set a warning and continue with post creation
                        console.warn("Continuing with post creation without product attachment.");
                        // Set error message but don't throw
                        setError(createProductError || "Could not attach product to post due to permission issues. The post will be created without a product.");
                    }
                } catch (productError) {
                    console.error("Error creating product:", productError);
                    // Instead of throwing an error, we'll set a warning and continue with post creation
                    console.warn("Continuing with post creation without product attachment.");
                    // Set error message but don't throw
                    setError("Could not attach product to post due to permission issues. The post will be created without a product.");
                }
            }

            // 2. Create Post Document
            const postData: any = {
                user_id: userId,
                text: caption,
                video_url: videoId,
                created_at: new Date().toISOString(),
            };

            // Only add primary_product_id if we have one and if the schema supports it
            if (primaryProductId) {
                try {
                    // First, check if the schema supports primary_product_id
                    // We'll do this by creating a test post with the field
                    postData.primary_product_id = primaryProductId;
                    console.log("Creating post document with data:", postData);

                    await getDatabases().createDocument(
                        String(process.env.NEXT_PUBLIC_DATABASE_ID),
                        String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                        ID.unique(),
                        postData
                    );
                    console.log("Post document created with product ID.");
                } catch (schemaError: any) {
                    // If we get a schema error, try again without the primary_product_id
                    if (schemaError.message && schemaError.message.includes("primary_product_id")) {
                        console.warn("Schema doesn't support primary_product_id. Creating post without product reference.");
                        setError("Your post was created, but couldn't be linked to the product. Please add the 'primary_product_id' field to your Post collection schema in AppWrite.");

                        // Remove the primary_product_id field and try again
                        delete postData.primary_product_id;

                        await getDatabases().createDocument(
                            String(process.env.NEXT_PUBLIC_DATABASE_ID),
                            String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                            ID.unique(),
                            postData
                        );
                        console.log("Post document created without product ID.");
                    } else {
                        // If it's some other error, rethrow it
                        throw schemaError;
                    }
                }
            } else {
                // No product ID, just create the post normally
                console.log("Creating post document with data:", postData);
                await getDatabases().createDocument(
                    String(process.env.NEXT_PUBLIC_DATABASE_ID),
                    String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                    ID.unique(),
                    postData
                );
                console.log("Post document created.");
            }

            // 3. Upload Video File
            console.log("Uploading video file with ID:", videoId);
            try {
                await getStorage().createFile(String(process.env.NEXT_PUBLIC_BUCKET_ID), videoId, videoFile);
                console.log("Video file uploaded.");
            } catch (uploadError: any) {
                console.error("Error uploading video file:", uploadError);
                if (uploadError.code === 401) {
                    setError("Authorization Error: You don't have permission to upload video files. Please check the AppWrite bucket permissions.");
                } else {
                    setError(uploadError.message || "Failed to upload video file.");
                }

                // Try to clean up the post document since the video upload failed
                try {
                    // Find the post document we just created
                    // Import Query from AppWriteClient
                    const { Query } = await import('@/libs/AppWriteClient');

                    const posts = await getDatabases().listDocuments(
                        String(process.env.NEXT_PUBLIC_DATABASE_ID),
                        String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                        [
                            Query.equal("video_url", videoId)
                        ]
                    );

                    if (posts.documents.length > 0) {
                        // Delete the post document
                        await getDatabases().deleteDocument(
                            String(process.env.NEXT_PUBLIC_DATABASE_ID),
                            String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                            posts.documents[0].$id
                        );
                        console.log("Cleaned up post document after video upload failed.");
                    }
                } catch (cleanupError) {
                    console.error("Failed to clean up post document:", cleanupError);
                }

                throw uploadError; // Re-throw the error to indicate failure
            }

            setIsSuccess(true);
            setIsLoading(false);
            return true; // Indicate success

        } catch (err: any) {
            console.error("Error in createPostWithProduct:", err);
            setError(err.message || "An unknown error occurred during post creation.");
            setIsLoading(false);
            setIsSuccess(false);
            // Re-throw the error so the calling component knows about it
            throw err;
        }
    };

    // Return the state and the function to trigger the process
    // Combine loading states if needed, or return separately
    return {
        createPostWithProduct,
        isLoading: isLoading || isCreatingProduct, // Combine loading states
        error,
        isSuccess
    };
};

export default useCreatePost;