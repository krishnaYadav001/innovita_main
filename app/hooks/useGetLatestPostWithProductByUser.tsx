import { useState, useEffect, useCallback } from 'react';
import { getDatabases, Query } from "@/libs/AppWriteClient"; // Use getter function
import { Post, Product } from '@/app/types'; // Assuming Post and Product types are defined here
import useGetProductById from './useGetProductById';

interface LatestPostWithProduct {
    post: Post | null;
    product: Product | null;
}

const useGetLatestPostWithProductByUser = (userId: string | undefined) => {
    const [latestData, setLatestData] = useState<LatestPostWithProduct>({ post: null, product: null });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // We need the product fetching hook internally
    const { product: fetchedProduct, isLoading: isLoadingProduct, error: productError, refetchProduct } = useGetProductById(latestData.post?.primary_product_id);

    const fetchLatestPost = useCallback(async () => {
        if (!userId) {
            setLatestData({ post: null, product: null });
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setLatestData({ post: null, product: null }); // Reset while fetching

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_POST) {
            setError("Database/Collection IDs for Posts are not configured in .env");
            setIsLoading(false);
            console.error("Error: Post Database/Collection IDs missing in .env");
            return;
        }

        try {
            // Fetch only the latest post for the user
            const response = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                [
                    Query.equal('user_id', userId),
                    Query.orderDesc("$createdAt"), // Order by creation time descending
                    Query.limit(1) // Limit to only one document
                ]
            );

            if (response.documents.length > 0) {
                const latestPostDoc = response.documents[0];
                const postResult: Post = {
                    id: latestPostDoc.$id,
                    user_id: latestPostDoc.user_id,
                    video_url: latestPostDoc.video_url,
                    text: latestPostDoc.text,
                    created_at: latestPostDoc.created_at,
                    primary_product_id: latestPostDoc.primary_product_id, // Include product ID
                    // Ensure other fields match the Post type if necessary
                };
                // Set the post first, the product fetch will trigger via useEffect below
                setLatestData({ post: postResult, product: null });
            } else {
                // No posts found for the user
                setLatestData({ post: null, product: null });
            }

        } catch (err: any) {
            console.error(`Error fetching latest post for user ${userId}:`, err);
            setError(err.message || "An unknown error occurred while fetching the latest post.");
            setLatestData({ post: null, product: null });
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Effect to fetch the product once the latest post (and its product ID) is known
    useEffect(() => {
        if (latestData.post?.primary_product_id) {
            // refetchProduct is automatically called by useGetProductById when its ID changes
            // We just need to update our state with the result from that hook
            setLatestData(prev => ({ ...prev, product: fetchedProduct }));
        } else {
             // Ensure product is null if post has no product ID
             setLatestData(prev => ({ ...prev, product: null }));
        }
        // Also update error state based on product fetching
        if (productError) {
            setError(prevError => prevError ? `${prevError}; ${productError}` : productError);
        }
    }, [fetchedProduct, productError, latestData.post?.primary_product_id]); // Depend on fetched product and post's product ID

    // Effect to trigger the initial post fetch when userId changes
    useEffect(() => {
        fetchLatestPost();
    }, [fetchLatestPost]); // fetchLatestPost callback depends on userId

    return {
        latestPost: latestData.post,
        linkedProduct: latestData.product,
        isLoading: isLoading || isLoadingProduct, // Combine loading states
        error,
        refetchLatestData: fetchLatestPost // Expose refetch function
    };
};

export default useGetLatestPostWithProductByUser;