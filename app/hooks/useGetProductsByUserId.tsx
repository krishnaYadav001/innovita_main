import { useState, useEffect, useCallback } from 'react';
import { getDatabases, Query } from '@/libs/AppWriteClient'; // Use getter function
import { Product } from '@/app/types';

const useGetProductsByUserId = (userId: string | undefined) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        if (!userId) {
            setProducts([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT) {
            setError("Database/Collection IDs are not configured in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection IDs missing in .env");
            return;
        }

        try {
            console.log(`Fetching posts for user: ${userId}`);
            // First, get all posts by this user
            const postsResponse = await getDatabases().listDocuments( // Use getter
                process.env.NEXT_PUBLIC_DATABASE_ID,
                process.env.NEXT_PUBLIC_COLLECTION_ID_POST!, // Add non-null assertion
                [
                    Query.equal('user_id', userId),
                    Query.orderDesc("$createdAt")
                ]
            );

            console.log(`Found ${postsResponse.documents.length} posts for user ${userId}`);

            // Extract unique product IDs from posts
            console.log('Post documents:', postsResponse.documents);

            // Filter posts that have a primary_product_id
            const postsWithProducts = postsResponse.documents.filter(doc =>
                doc.primary_product_id && doc.primary_product_id !== '' && doc.primary_product_id !== null
            );

            console.log(`Found ${postsWithProducts.length} posts with products`);

            // Get unique product IDs
            const productIds = Array.from(new Set( // Use Array.from() for Set iteration
                postsWithProducts.map(doc => doc.primary_product_id)
            ));

            console.log('Product IDs:', productIds);

            if (productIds.length === 0) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            // Fetch all products with these IDs
            console.log(`Attempting to fetch ${productIds.length} products`);

            const productPromises = productIds.map(async (productId) => {
                try {
                    console.log(`Fetching product with ID: ${productId}`);
                    const doc = await getDatabases().getDocument( // Use getter
                        process.env.NEXT_PUBLIC_DATABASE_ID!,
                        process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT!,
                        productId
                    );

                    console.log(`Successfully fetched product: ${doc.$id}`);

                    // Validate that the document has the required fields
                    if (!doc.name || typeof doc.price === 'undefined' || !doc.product_url) {
                        console.error(`Product document is missing required fields:`, doc);
                        return null;
                    }

                    return {
                        id: doc.$id,
                        name: doc.name,
                        price: doc.price,
                        product_url: doc.product_url,
                        image_url: doc.image_url || undefined,
                        imageId: doc.imageId || '',
                    } as Product;
                } catch (err: any) {
                    console.error(`Error fetching product ${productId}:`, err);
                    // Don't return null for 404 errors - the product might have been deleted
                    if (err.code === 404) {
                        console.log(`Product ${productId} not found - it may have been deleted`);
                    }
                    return null;
                }
            });

            const resolvedProducts = await Promise.all(productPromises);
            const fetchedProducts = resolvedProducts.filter(product => product !== null) as Product[];

            console.log(`Successfully fetched ${fetchedProducts.length} products out of ${productIds.length} IDs`);
            console.log('Fetched products:', fetchedProducts);

            setProducts(fetchedProducts);

        } catch (err: any) {
            console.error("Error fetching products by user:", err);

            // Provide more specific error messages based on the error code
            if (err.code) {
                console.log(`Error code: ${err.code}`);

                if (err.code === 404) {
                    setError("The requested resource was not found. Please check if the collections exist.");
                } else if (err.code === 401) {
                    setError("Authentication error. Please check your API keys and permissions.");
                } else if (err.code === 400) {
                    setError(`Bad request: ${err.message}. This might be due to an invalid query parameter.`);
                } else {
                    setError(`Error ${err.code}: ${err.message || "An unknown error occurred while fetching products."}`);
                }
            } else {
                setError(err.message || "An unknown error occurred while fetching products.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, isLoading, error, refetchProducts: fetchProducts };
};

export default useGetProductsByUserId;
