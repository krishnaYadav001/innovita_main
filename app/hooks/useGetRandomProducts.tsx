import { useState, useEffect } from 'react';
import { getDatabases, Query } from '@/libs/AppWriteClient'; // Use getter function
import { Product } from '@/app/types';

const useGetRandomProducts = (limit: number = 3, excludeProductId?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      setIsLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT) {
        setError("Database/Collection IDs are not configured in .env");
        setIsLoading(false);
        console.error("Error: Database/Collection IDs missing in .env");
        return;
      }

      try {
        // Fetch all products first
        const response = await getDatabases().listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID,
          process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
          []
        );

        // Map Appwrite documents to Product type
        let fetchedProducts = response.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          price: doc.price,
          product_url: doc.product_url,
          image_url: doc.image_url || undefined,
          imageId: doc.imageId || '',
        })) as Product[];

        // Filter out the excluded product if provided
        if (excludeProductId) {
          fetchedProducts = fetchedProducts.filter(product => product.id !== excludeProductId);
        }

        // Shuffle the array to get random products
        fetchedProducts = shuffleArray(fetchedProducts);

        // Limit the number of products
        fetchedProducts = fetchedProducts.slice(0, limit);

        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching random products:", err);
        setError(err.message || "An unknown error occurred while fetching products.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomProducts();
  }, [limit, excludeProductId]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: Product[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return { products, isLoading, error };
};

export default useGetRandomProducts;
