// This script fixes posts that reference non-existent products
require('dotenv').config();
const { Client, Databases, Query } = require('node-appwrite');

// Initialize AppWrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL)
    .setProject(process.env.NEXT_PUBLIC_ENDPOINT);

// Initialize database
const databases = new Databases(client);

// Function to get all posts
async function getAllPosts() {
    try {
        console.log('Fetching all posts...');
        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_POST
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// Function to check if a product exists
async function checkProductExists(productId) {
    if (!productId) return false;
    
    try {
        await databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT,
            productId
        );
        return true;
    } catch (error) {
        if (error.code === 404) {
            return false;
        }
        throw error;
    }
}

// Function to update a post
async function updatePost(postId, data) {
    try {
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
            postId,
            data
        );
        console.log(`Post ${postId} updated successfully`);
        return true;
    } catch (error) {
        console.error(`Error updating post ${postId}:`, error);
        return false;
    }
}

// Main function to fix posts
async function fixPosts() {
    try {
        // Get all posts
        const posts = await getAllPosts();
        console.log(`Found ${posts.length} posts`);
        
        // Check each post for non-existent product references
        for (const post of posts) {
            if (post.primary_product_id) {
                console.log(`Checking product ${post.primary_product_id} for post ${post.$id}...`);
                const productExists = await checkProductExists(post.primary_product_id);
                
                if (!productExists) {
                    console.log(`Product ${post.primary_product_id} does not exist. Updating post ${post.$id}...`);
                    await updatePost(post.$id, { primary_product_id: null });
                } else {
                    console.log(`Product ${post.primary_product_id} exists for post ${post.$id}`);
                }
            }
        }
        
        console.log('All posts fixed successfully');
    } catch (error) {
        console.error('Error fixing posts:', error);
    }
}

// Run the fix
fixPosts();
