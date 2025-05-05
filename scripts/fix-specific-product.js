// This script fixes posts that reference a specific non-existent product
require('dotenv').config();
const { Client, Databases, Query } = require('node-appwrite');

// Initialize AppWrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL)
    .setProject(process.env.NEXT_PUBLIC_ENDPOINT);

// Initialize database
const databases = new Databases(client);

// The specific product ID that's causing issues
const PROBLEMATIC_PRODUCT_ID = '67ede2b1382fea7a0f35';

// Function to get all posts that reference the problematic product
async function getPostsWithProblematicProduct() {
    try {
        console.log(`Fetching posts that reference product ID: ${PROBLEMATIC_PRODUCT_ID}...`);
        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASE_ID,
            process.env.NEXT_PUBLIC_COLLECTION_ID_POST,
            [Query.equal('primary_product_id', PROBLEMATIC_PRODUCT_ID)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching posts:', error);
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
async function fixSpecificProduct() {
    try {
        // Get posts that reference the problematic product
        const posts = await getPostsWithProblematicProduct();
        console.log(`Found ${posts.length} posts referencing product ID: ${PROBLEMATIC_PRODUCT_ID}`);
        
        // Update each post to remove the reference
        for (const post of posts) {
            console.log(`Updating post ${post.$id} to remove reference to product ${PROBLEMATIC_PRODUCT_ID}...`);
            await updatePost(post.$id, { primary_product_id: null });
        }
        
        console.log('All posts fixed successfully');
    } catch (error) {
        console.error('Error fixing posts:', error);
    }
}

// Run the fix
fixSpecificProduct();
