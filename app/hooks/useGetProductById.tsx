import { useState, useEffect, useCallback } from 'react';
import { getDatabases } from '@/libs/AppWriteClient'; // Use getter function
import { Product } from '@/app/types';
import { Models } from 'appwrite'; // Import Models for type hinting

const useGetProductById = (productId: string | null | undefined) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        if (!productId) {
            setProduct(null);
            setIsLoading(false);
            setError(null);
            return; // No ID, nothing to fetch
        }

        setIsLoading(true);
        setError(null);
        setProduct(null); // Clear previous product while fetching

        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT) {
            setError("Database/Collection IDs are not configured in .env");
            setIsLoading(false);
            console.error("Error: Database/Collection IDs missing in .env");
            return;
        }

        try {
            console.log(`Fetching product with ID: ${productId}`);
            const doc = await getDatabases().getDocument( // Use getter
                process.env.NEXT_PUBLIC_DATABASE_ID,
                process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                productId
            );

            console.log("Product document fetched:", doc);

            // Validate that the document has the required fields
            if (!doc.name || typeof doc.price === 'undefined' || !doc.product_url) {
                console.error(`Product document is missing required fields:`, doc);
                setError(`Product data is incomplete. Some required fields are missing.`);
                setProduct(null);
                return;
            }

            // Map Appwrite document to Product type
            const fetchedProduct: Product = {
                id: doc.$id,
                name: doc.name,
                price: doc.price,
                product_url: doc.product_url,
                image_url: doc.image_url || undefined,
                imageId: doc.imageId || '', // Provide default for imageId if missing
            };
            setProduct(fetchedProduct);
            console.log("Product successfully mapped:", fetchedProduct);

        } catch (err: any) {
            console.error(`Error fetching product ${productId}:`, err);
            // Handle specific error cases, e.g., document not found
            if (err.code === 404) {
                 setError(`Product with ID ${productId} not found. It may have been deleted or never existed.`);
            } else {
                setError(err.message || `An unknown error occurred while fetching product ${productId}.`);
            }
            setProduct(null); // Ensure product is null on error
        } finally {
            setIsLoading(false);
        }
    }, [productId]); // Dependency array includes productId

    // Only run the initial fetch when the productId changes
    // The refetchProduct function will be called manually when needed
    useEffect(() => {
        // Only fetch if we have a productId
        if (productId) {
            fetchProduct();
        }
    }, [productId]); // Only depend on productId, not on fetchProduct

    return { product, isLoading, error, refetchProduct: fetchProduct }; // Expose refetch function
};

export default useGetProductById;