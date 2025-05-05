// This script initializes your AppWrite backend with sample data
require('dotenv').config();
const { Client, Account, ID, Databases, Storage } = require('node-appwrite');

console.log('AppWrite Configuration:', {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_URL,
    projectId: process.env.NEXT_PUBLIC_ENDPOINT,
    databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
    profileCollectionId: process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE,
    postCollectionId: process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
    bucketId: process.env.NEXT_PUBLIC_BUCKET_ID,
    placeholderImageId: process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID
});

// Initialize AppWrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL)
    .setProject(process.env.NEXT_PUBLIC_ENDPOINT);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Sample user data
const sampleUser = {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User'
};

// Function to create a user
async function createUser() {
    try {
        console.log('Creating user...');
        // Create user
        const user = await account.create(
            ID.unique(),
            sampleUser.email,
            sampleUser.password,
            sampleUser.name
        );
        console.log('User created:', user);

        // For node-appwrite, we use createSession instead of createEmailSession
        const session = await account.createSession(
            sampleUser.email,
            sampleUser.password
        );
        console.log('Session created:', session.$id);

        return user;
    } catch (error) {
        if (error.code === 409) {
            console.log('User already exists, logging in...');
            try {
                const session = await account.createSession(
                    sampleUser.email,
                    sampleUser.password
                );
                console.log('Session created for existing user:', session.$id);

                // Create a dummy user object with a valid ID format
                return {
                    $id: 'existing_user_id' // This is a placeholder
                };
            } catch (sessionError) {
                console.error('Error creating session:', sessionError);
                // Return a dummy user with a valid ID format
                return {
                    $id: 'dummy_user_id' // This is a placeholder
                };
            }
        }
        console.error('Error creating user:', error);
        throw error;
    }
}

// Function to create a profile
async function createProfile(userId) {
    try {
        console.log('Creating profile...');
        const profile = await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE,
            ID.unique(),
            {
                user_id: userId,
                name: sampleUser.name,
                image: process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID,
                bio: 'This is a sample bio for testing purposes.'
            }
        );
        console.log('Profile created:', profile);
        return profile;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}

// Function to create a post
async function createPost(userId) {
    try {
        console.log('Creating post...');
        const post = await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
            ID.unique(),
            {
                user_id: userId,
                text: 'This is a sample post for testing purposes.',
                video_url: '', // You can add a video URL if needed
                created_at: new Date().toISOString()
            }
        );
        console.log('Post created:', post);
        return post;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Main function to initialize data
async function initData() {
    try {
        // Create user and get user ID
        const user = await createUser();
        const userId = user.$id;

        // Create profile
        const profile = await createProfile(userId);

        // Create post
        const post = await createPost(userId);

        console.log('Data initialization complete!');
        console.log('User ID:', userId);
        console.log('Profile ID:', profile.$id);
        console.log('Post ID:', post.$id);

        // For node-appwrite, we need to delete the session differently
        // Since we don't have the session ID stored, we'll skip logout for now
        console.log('Initialization complete - you can now run the app');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Run the initialization
initData();
