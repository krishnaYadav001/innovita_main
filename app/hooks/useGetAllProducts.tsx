import { useState, useEffect } from 'react';
import { getDatabases, Query } from '@/libs/AppWriteClient'; // Use getter function
import { Product } from '@/app/types'; // Assuming Product type is defined here

const useGetAllProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT) {
                setError("Database/Collection IDs are not configured in .env");
                setIsLoading(false);
                console.error("Error: Database/Collection IDs missing in .env");
                return;
            }

            try {
                const response = await getDatabases().listDocuments( // Use getter
                    process.env.NEXT_PUBLIC_DATABASE_ID,
                    process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                    [
                        // Add any queries here if needed, e.g., Query.limit(100)
                        Query.orderDesc('$createdAt') // Example: Get newest first
                    ]
                );

                // Map Appwrite documents to Product type
                const fetchedProducts = response.documents.map(doc => ({
                    id: doc.$id,
                    name: doc.name,
                    price: doc.price,
                    product_url: doc.product_url,
                    image_url: doc.image_url, // Keep for potential legacy use? Or remove? Let's keep for now but prioritize imageId
                    imageId: doc.imageId, // Added this line
                    user_id: doc.user_id, // Include user_id if available
                    // Map other fields if necessary
                })) as Product[];

                setProducts(fetchedProducts);

            } catch (err: any) {
                console.error("Error fetching products:", err);
                setError(err.message || "An unknown error occurred while fetching products.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); // Empty dependency array means this runs once on mount

    // Optional: Function to manually refetch products if needed
    const refetchProducts = async () => {
         setIsLoading(true);
            setError(null);

            if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT) {
                setError("Database/Collection IDs are not configured in .env");
                setIsLoading(false);
                console.error("Error: Database/Collection IDs missing in .env");
                return;
            }

            try {
                const response = await getDatabases().listDocuments( // Use getter
                    process.env.NEXT_PUBLIC_DATABASE_ID,
                    process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
                     [Query.orderDesc('$createdAt')]
                );
                 const fetchedProducts = response.documents.map(doc => ({
                    id: doc.$id,
                    name: doc.name,
                    price: doc.price,
                    product_url: doc.product_url,
                    image_url: doc.image_url, // Keep for potential legacy use? Or remove? Let's keep for now but prioritize imageId
                    imageId: doc.imageId, // Added this line
                })) as Product[];
                // Removed log
                setProducts(fetchedProducts); // Using direct set, should be fine but let's keep it simple
            } catch (err: any) {
                 console.error("Error refetching products:", err);
                setError(err.message || "An unknown error occurred while refetching products.");
            } finally {
                setIsLoading(false);
            }
    }


    return { products, isLoading, error, refetchProducts };
};

export default useGetAllProducts;