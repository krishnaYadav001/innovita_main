import { Query, getDatabases, ID, getAccount } from "@/libs/AppWriteClient"; // Use getter functions

const useGetProfileByUserId = async (userId: string) => {
    // If no userId is provided, return a default profile
    if (!userId) {
        console.warn('(Hook) No user ID provided to useGetProfileByUserId');
        return createDefaultProfile('unknown');
    }

    try {
        // First check if the profile collection exists
        if (!process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE) {
            console.error('Profile collection ID not defined in environment variables');
            return createDefaultProfile(userId);
        }

        try {
            const response = await getDatabases().listDocuments( // Use getter
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
                [
                    Query.equal('user_id', userId)
                ]
            );

            const documents = response.documents;

            if (documents.length === 0) {
                console.warn(`(Hook) No profile found for user ID: ${userId}. Attempting to create one.`);

                // Profile doesn't exist, let's create it
                try {
                    // Fetch the user's account details to get their name
                    let userName = 'New User'; // Default name
                    try {
                        const userAccount = await getAccount().get(); // Use getter
                        // Only use the name if the fetched account ID matches the requested userId
                        if (userAccount.$id === userId) {
                            userName = userAccount.name;
                        } else {
                             console.warn(`(Hook) Fetched account ID (${userAccount.$id}) does not match requested profile user ID (${userId}). Using default name.`);
                        }
                    } catch (accountError) {
                        console.error(`(Hook) Failed to fetch account details for user ID: ${userId} during profile creation. Using default name.`, accountError);
                        // Proceed with default name if account fetch fails
                    }

                    console.log(`(Hook) Creating new profile for user ID: ${userId} with name: ${userName}`);
                    const defaultImage = process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || '';

                    try {
                        const newProfileDoc = await getDatabases().createDocument( // Use getter
                            String(process.env.NEXT_PUBLIC_DATABASE_ID),
                            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
                            ID.unique(), // Let Appwrite generate document ID
                            {
                                user_id: userId, // Link to the user account
                                name: userName,
                                image: defaultImage,
                                Bio: '' // Default empty bio - Use capital 'B'
                            }
                        );
                        console.log('(Hook) Profile created successfully:', newProfileDoc);

                        // Return the newly created profile data
                        return {
                            id: newProfileDoc.$id,
                            user_id: newProfileDoc.user_id,
                            name: newProfileDoc.name,
                            image: newProfileDoc.image,
                            bio: newProfileDoc.Bio || newProfileDoc.bio || '' // Try both Bio and bio fields for compatibility
                        };
                    } catch (createDocError) {
                        console.error(`(Hook) Failed to create profile document: ${createDocError}`);
                        // If we can't create the profile, return a default one
                        return createDefaultProfile(userId, userName);
                    }
                } catch (createError) {
                    console.error(`(Hook) Failed to create profile for user ID: ${userId}`, createError);
                    return createDefaultProfile(userId); // Return default profile if creation fails
                }
            }

            // Validate the profile data before returning
            if (!documents[0].name || !documents[0].image) {
                console.warn(`(Hook) Profile for user ID: ${userId} has missing data. Using defaults for missing fields.`);
                return {
                    id: documents[0].$id,
                    user_id: documents[0].user_id,
                    name: documents[0].name || 'User',
                    image: documents[0].image || (process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || ''),
                    bio: documents[0].Bio || documents[0].bio || '' // Try both Bio and bio fields for compatibility
                };
            }

            // Return the first found profile
            return {
                id: documents[0].$id,
                user_id: documents[0].user_id,
                name: documents[0].name,
                image: documents[0].image,
                bio: documents[0].Bio || documents[0].bio || '' // Try both Bio and bio fields for compatibility
            };
        } catch (dbError) {
            console.error(`Database error when fetching profile for user ID: ${userId}`, dbError);
            // Check if the error is due to collection not existing (with type check)
            if (dbError instanceof Error && dbError.message && dbError.message.includes('Collection with the requested ID could not be found')) {
                console.error('Profile collection does not exist. Please create it in AppWrite.');
            }
            return createDefaultProfile(userId);
        }
    } catch (error) {
        console.error(`Unexpected error in useGetProfileByUserId for user ID: ${userId}`, error);
        return createDefaultProfile(userId);
    }
}

// Helper function to create a default profile when real data can't be fetched or created
const createDefaultProfile = (userId: string, name: string = 'User') => {
    console.log(`(Hook) Creating default profile object for user ID: ${userId}`);
    return {
        id: `temp_${userId}_${Date.now()}`,
        user_id: userId,
        name: name,
        image: process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || '',
        bio: ''
    };
}

export default useGetProfileByUserId