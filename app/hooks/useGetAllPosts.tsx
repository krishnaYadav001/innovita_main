import { getDatabases, Query } from "@/libs/AppWriteClient" // Use getter function
import useGetProfileByUserId from "./useGetProfileByUserId";

const useGetAllPosts = async () => {
    try {
        // Check if required environment variables are set
        if (!process.env.NEXT_PUBLIC_DATABASE_ID || !process.env.NEXT_PUBLIC_COLLECTION_ID_POST) {
            console.error('Missing required environment variables for posts collection');
            return []; // Return empty array instead of throwing error
        }

        try {
            const response = await getDatabases().listDocuments( // Use getter
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
                [ Query.orderDesc("$id") ]
            );

            // If no documents, return empty array
            if (!response.documents || response.documents.length === 0) {
                console.log('No posts found in the database');
                return [];
            }

            const documents = response.documents;

            const objPromises = documents.map(async doc => {
                // Skip invalid documents
                if (!doc || !doc.$id) {
                    console.warn('Invalid post document found, skipping');
                    return null;
                }

                // Get profile with error handling
                let profile;
                try {
                    profile = await useGetProfileByUserId(doc?.user_id);
                } catch (profileError) {
                    console.error(`Error fetching profile for post ${doc.$id}:`, profileError);
                    // Create a default profile if fetch fails
                    profile = {
                        user_id: doc?.user_id || 'unknown',
                        name: 'Unknown User',
                        image: process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || '',
                    };
                }

                return {
                    id: doc.$id,
                    user_id: doc.user_id || 'unknown',
                    video_url: doc.video_url || '',
                    text: doc.text || '',
                    created_at: doc.created_at || new Date().toISOString(),
                    primary_product_id: doc.primary_product_id || null,
                    profile: {
                        user_id: profile?.user_id || 'unknown',
                        name: profile?.name || 'Unknown User',
                        image: profile?.image || (process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || ''),
                    }
                };
            });

            // Filter out null values (invalid documents)
            const results = (await Promise.all(objPromises)).filter(post => post !== null);
            return results;
        } catch (dbError) {
            console.error('Database error when fetching posts:', dbError);

            // Check if the error is due to collection not existing
            if (dbError instanceof Error &&
                dbError.message &&
                dbError.message.includes('Collection with the requested ID could not be found')) {
                console.error('Posts collection does not exist. Please create it in AppWrite.');
            }

            return []; // Return empty array instead of throwing error
        }
    } catch (error) {
        console.error('Unexpected error in useGetAllPosts:', error);
        return []; // Return empty array instead of throwing error
    }
}

export default useGetAllPosts