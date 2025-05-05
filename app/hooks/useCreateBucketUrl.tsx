// Cache to store already generated URLs
const urlCache: Record<string, string> = {};

// Local fallback image path - use this as a last resort
const LOCAL_DEFAULT_PROFILE_IMAGE = '/images/placeholder-user.png';

// Flag to track if we're already trying to use the placeholder
let isUsingPlaceholder = false;

// Get the placeholder image ID from environment variables
const getPlaceholderImageId = () => {
    return process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || '';
};

const useCreateBucketUrl = (fileId: string, isPlaceholder = false) => {
    // Reset the flag if this is a direct call (not from an error handler)
    if (!isPlaceholder) {
        isUsingPlaceholder = false;
    }

    // If we're already trying to use the placeholder and it's failing,
    // use the local fallback to prevent infinite loops
    if (isUsingPlaceholder) {
        return LOCAL_DEFAULT_PROFILE_IMAGE;
    }

    // If no fileId is provided, use the placeholder image ID from env
    if (!fileId) {
        const placeholderId = getPlaceholderImageId();
        if (!placeholderId) {
            console.warn('No file ID provided and no placeholder image ID set in environment variables');
            return LOCAL_DEFAULT_PROFILE_IMAGE;
        }
        fileId = placeholderId;
        isUsingPlaceholder = true;
    }

    // Check if URL is already in cache
    if (urlCache[fileId]) {
        return urlCache[fileId];
    }

    const url = process.env.NEXT_PUBLIC_APPWRITE_URL;
    const id = process.env.NEXT_PUBLIC_BUCKET_ID;
    const projectId = process.env.NEXT_PUBLIC_ENDPOINT;

    // If any required env variable is missing, return local fallback
    if (!url || !id || !projectId) {
        console.warn('Missing required environment variables for Appwrite URL generation');
        return LOCAL_DEFAULT_PROFILE_IMAGE;
    }

    // Generate the URL
    const generatedUrl = `${url}/storage/buckets/${id}/files/${fileId}/view?project=${projectId}`;

    // Cache the URL for future use
    urlCache[fileId] = generatedUrl;

    return generatedUrl;
}

export default useCreateBucketUrl