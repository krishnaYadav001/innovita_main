// This script checks your Appwrite configuration and verifies that all required collections exist
require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

// Initialize AppWrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL)
    .setProject(process.env.NEXT_PUBLIC_ENDPOINT);

// Initialize database
const databases = new Databases(client);

// Required collections
const requiredCollections = [
    {
        id: process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE,
        name: 'Profile Collection',
        fields: ['user_id', 'name', 'image', 'bio']
    },
    {
        id: process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
        name: 'Post Collection',
        fields: ['user_id', 'video_url', 'text', 'created_at']
    },
    {
        id: process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE,
        name: 'Like Collection',
        fields: ['user_id', 'post_id']
    },
    {
        id: process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT,
        name: 'Comment Collection',
        fields: ['user_id', 'post_id', 'text', 'created_at']
    },
    {
        id: process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
        name: 'Product Collection',
        fields: ['name', 'price', 'product_url', 'imageId', 'user_id']
    }
];

// Function to check if a collection exists
async function checkCollection(collectionId, collectionName, requiredFields) {
    try {
        console.log(`Checking ${collectionName} (ID: ${collectionId})...`);
        
        if (!collectionId) {
            console.error(`❌ ${collectionName} ID is not defined in your .env file`);
            return false;
        }

        // Try to get the collection
        const collection = await databases.getCollection(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            collectionId
        );
        
        console.log(`✅ ${collectionName} exists`);
        
        // Check if the collection has the required fields
        const attributes = collection.attributes;
        const missingFields = [];
        
        for (const field of requiredFields) {
            const hasField = attributes.some(attr => attr.key === field);
            if (!hasField) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            console.warn(`⚠️ ${collectionName} is missing the following fields: ${missingFields.join(', ')}`);
            return false;
        }
        
        return true;
    } catch (error) {
        if (error.code === 404) {
            console.error(`❌ ${collectionName} does not exist`);
        } else {
            console.error(`❌ Error checking ${collectionName}:`, error);
        }
        return false;
    }
}

// Function to check if the database exists
async function checkDatabase() {
    try {
        console.log(`Checking database (ID: ${process.env.NEXT_PUBLIC_DATABASE_ID})...`);
        
        if (!process.env.NEXT_PUBLIC_DATABASE_ID) {
            console.error('❌ Database ID is not defined in your .env file');
            return false;
        }

        // Try to get the database
        const database = await databases.get(process.env.NEXT_PUBLIC_DATABASE_ID);
        console.log(`✅ Database exists: ${database.name}`);
        return true;
    } catch (error) {
        if (error.code === 404) {
            console.error('❌ Database does not exist');
        } else {
            console.error('❌ Error checking database:', error);
        }
        return false;
    }
}

// Function to check if the bucket exists
async function checkBucket() {
    try {
        console.log(`Checking storage bucket (ID: ${process.env.NEXT_PUBLIC_BUCKET_ID})...`);
        
        if (!process.env.NEXT_PUBLIC_BUCKET_ID) {
            console.error('❌ Bucket ID is not defined in your .env file');
            return false;
        }

        // We can't directly check the bucket without the Storage service
        // But we can check if the placeholder image exists
        if (!process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID) {
            console.warn('⚠️ Placeholder image ID is not defined in your .env file');
        } else {
            console.log(`ℹ️ Placeholder image ID is defined: ${process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error checking bucket:', error);
        return false;
    }
}

// Main function to check all configurations
async function checkAppwriteConfig() {
    console.log('🔍 Checking Appwrite Configuration...');
    console.log('====================================');
    
    // Check environment variables
    console.log('Checking environment variables...');
    const requiredEnvVars = [
        'NEXT_PUBLIC_APPWRITE_URL',
        'NEXT_PUBLIC_ENDPOINT',
        'NEXT_PUBLIC_DATABASE_ID',
        'NEXT_PUBLIC_BUCKET_ID'
    ];
    
    let missingEnvVars = [];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missingEnvVars.push(envVar);
        }
    }
    
    if (missingEnvVars.length > 0) {
        console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
        console.log('Please add these variables to your .env file');
        return;
    }
    
    console.log('✅ All required environment variables are defined');
    console.log('====================================');
    
    // Check database
    const databaseExists = await checkDatabase();
    if (!databaseExists) {
        console.log('Please create the database in your Appwrite console');
        return;
    }
    console.log('====================================');
    
    // Check collections
    let missingCollections = [];
    for (const collection of requiredCollections) {
        const collectionExists = await checkCollection(collection.id, collection.name, collection.fields);
        if (!collectionExists) {
            missingCollections.push(collection.name);
        }
    }
    
    if (missingCollections.length > 0) {
        console.log('====================================');
        console.error(`❌ The following collections are missing or incomplete: ${missingCollections.join(', ')}`);
        console.log('Please create these collections in your Appwrite console');
    } else {
        console.log('====================================');
        console.log('✅ All required collections exist and have the necessary fields');
    }
    
    // Check bucket
    console.log('====================================');
    await checkBucket();
    
    console.log('====================================');
    console.log('🔍 Appwrite Configuration Check Complete');
}

// Run the check
checkAppwriteConfig().catch(error => {
    console.error('Error running configuration check:', error);
});
