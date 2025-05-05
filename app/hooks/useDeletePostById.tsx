import { getDatabases, Query, getStorage } from "@/libs/AppWriteClient"; // Use getter functions
import useDeleteComment from "./useDeleteComment";
import useDeleteLike from "./useDeleteLike";
import useGetCommentsByPostId from "./useGetCommentsByPostId";
import useGetLikesByPostId from "./useGetLikesByPostId";
import useDeleteProduct from "./useDeleteProduct"; // Import product delete hook factory
// No need to import useGetProductById, we can fetch directly

// Parameter 'currentImage' seems to be the videoId/video_url based on usage
const useDeletePostById = () => { // Make this a hook factory
    // Get the deleteProduct function from the hook
    const { deleteProduct: deleteProductFunc, isLoading: isDeletingProduct, error: productDeleteError } = useDeleteProduct();

    // Return the actual deletion function
    const deletePostAndProduct = async (postId: string, videoId: string) => {
    try {
        // 1. Fetch the Post document to get linked product ID
        const postDoc = await getDatabases().getDocument(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
            postId
        );
        const primaryProductId = postDoc?.primary_product_id;

        // 2. Delete Linked Product (if exists)
        if (primaryProductId) {
            try {
                // Fetch the product to get its imageId
                const productDoc = await getDatabases().getDocument(
                    String(process.env.NEXT_PUBLIC_DATABASE_ID),
                    String(process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT),
                    primaryProductId
                );
                const productImageId = productDoc?.imageId;

                if (productImageId) {
                     console.log(`Post ${postId} has linked product ${primaryProductId}. Deleting product...`);
                     // Call the function obtained from the hook
                     await deleteProductFunc(primaryProductId, productImageId);
                     console.log(`Product ${primaryProductId} deleted successfully.`);
                } else {
                     console.warn(`Product ${primaryProductId} linked to post ${postId} has no imageId. Deleting product document only.`);
                     // Fallback: Delete document even if imageId is missing (might leave orphaned image)
                      await getDatabases().deleteDocument(
                         String(process.env.NEXT_PUBLIC_DATABASE_ID),
                         String(process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT),
                         primaryProductId
                     );
                }
            } catch (productDeleteError: any) {
                console.error(`Failed to delete product ${primaryProductId} linked to post ${postId}:`, productDeleteError);
                // Decide if post deletion should continue. For now, we'll let it continue.
                // Use productDeleteError state from the hook if needed for more detailed reporting
            }
        }

        // 3. Delete Likes & Comments (existing logic)
        const likes = await useGetLikesByPostId(postId)
        likes.forEach(async like => { await useDeleteLike(like?.id) })

        const comments = await useGetCommentsByPostId(postId)
        comments.forEach(async comment => { await useDeleteComment(comment?.id) })

        await getDatabases().deleteDocument(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
            postId
        );
        // 4. Delete Post Document (existing logic) - Moved after deleting dependencies

        // 5. Delete Video File (using the passed videoId)
        console.log(`Deleting video file ${videoId} for post ${postId}`);
        await getStorage().deleteFile(String(process.env.NEXT_PUBLIC_BUCKET_ID), videoId);
        } catch (error) {
            console.error(`Error during post deletion process for ${postId}:`, error);
            throw error; // Re-throw to signal failure
        }
    };

    // Return the function to be called by components
    return { deletePostAndProduct };
}

export default useDeletePostById;