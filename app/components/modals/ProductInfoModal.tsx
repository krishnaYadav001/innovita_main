"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BiLoaderCircle } from 'react-icons/bi';
import { BsShop, BsX } from 'react-icons/bs'; // Added BsX for close icon
import useGetProductById from '@/app/hooks/useGetProductById';
import useDeleteProduct from '@/app/hooks/useDeleteProduct';
import useUpdatePost from '@/app/hooks/useUpdatePost';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import { Product } from '@/app/types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import AddToCartButton from '@/app/components/AddToCartButton';
import { useCartStore } from '@/app/stores/cart';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface ProductInfoModalProps {
    postId: string; // ID of the post this modal is related to
    primaryProductId: string | null | undefined; // ID of the product to display
    isCurrentUserPostCreator: boolean;
    isVisible: boolean; // Controls modal visibility
    onClose: () => void; // Function to close this modal
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({
    postId,
    primaryProductId,
    isCurrentUserPostCreator,
    isVisible,
    onClose
}) => {
    // Fetch the primary linked product based on the passed ID
    const {
        product: primaryProduct,
        isLoading: isLoadingProduct,
        error: productError,
        refetchProduct
    } = useGetProductById(primaryProductId); // Use the prop

    // Debug log to check product data
    useEffect(() => {
        if (primaryProduct) {
            console.log('Product data loaded:', primaryProduct);
        }
    }, [primaryProduct]);

    // Get cart items to check for ratings
    const { items } = useCartStore();

    // Function to render star rating
    const renderStarRating = (rating: number) => {
        const stars = []

        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                // Full star
                stars.push(<FaStar key={i} className="text-yellow-400" />)
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                // Half star
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
            } else {
                // Empty star
                stars.push(<FaRegStar key={i} className="text-yellow-400" />)
            }
        }

        return (
            <div className="flex space-x-1 justify-center">
                {stars}
            </div>
        )
    }

    // Get rating for a product from cart items
    const getProductRating = (productId: string) => {
        const cartItem = items.find(item => item.id === productId)
        return cartItem?.rating || 0
    }

    // Instantiate action hooks
    const { deleteProduct, isLoading: isDeletingProduct, error: deleteError } = useDeleteProduct();
    const { updatePost, isLoading: isUpdatingPost } = useUpdatePost();

    // State for managing loading/error during delete+update combo
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [processError, setProcessError] = useState<string | null>(null);

    // State for Add/Edit Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Reset local state when visibility changes or product ID changes
    // Use a ref to track if we've already fetched the product for this modal session
    const hasRefetchedRef = useRef(false);

    useEffect(() => {
        if (!isVisible) {
            // Reset state when modal closes
            setIsProcessingDelete(false);
            setProcessError(null);
            setShowAddModal(false);
            setShowEditModal(false);
            // Reset the ref when modal closes
            hasRefetchedRef.current = false;
            return;
        }

        // Only refetch the product once when the modal becomes visible
        if (primaryProductId && !hasRefetchedRef.current) {
            console.log(`Fetching product with ID: ${primaryProductId}`);
            refetchProduct();
            // Mark that we've fetched for this modal session
            hasRefetchedRef.current = true;
        }
    }, [isVisible, primaryProductId]); // Only depend on visibility and productId


    // --- Action Handlers ---
    const handleDeleteProduct = async () => {
        if (!primaryProduct || !postId) return;

        const confirmDelete = window.confirm(`Are you sure you want to delete the product "${primaryProduct.name}" and unlink it from this post?`);
        if (!confirmDelete) return;

        setIsProcessingDelete(true);
        setProcessError(null);

        const productDeleted = await deleteProduct(primaryProduct.id, primaryProduct.imageId);

        if (productDeleted) {
            const postUpdated = await updatePost(postId, { primary_product_id: null });
            if (postUpdated) {
                await refetchProduct();
            } else {
                setProcessError("Product was deleted, but failed to unlink it from the post. Please refresh.");
            }
        } else {
            setProcessError(deleteError || "Failed to delete the product.");
        }
        setIsProcessingDelete(false);
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
    };

    const handleOpenEditModal = () => {
        if (!primaryProduct) return;
        setShowEditModal(true);
    };

    // Render nothing if not visible
    if (!isVisible) {
        return null;
    }

    // --- Render ---
    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 pt-20 backdrop-blur-sm overflow-y-auto custom-scrollbar">
                {/* Modal Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full relative border border-gray-200 dark:border-gray-700 max-h-[75vh] overflow-hidden my-6">
                    {/* Sticky header */}
                    <div className="sticky top-0 left-0 right-0 bg-white dark:bg-gray-800 pt-3 pb-3 px-6 border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-black dark:text-white">Linked Product</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-md"
                                aria-label="Close product view"
                                disabled={isProcessingDelete || isUpdatingPost || isDeletingProduct}
                            >
                                <BsX size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content area */}
                    <div className="p-6 pt-5 overflow-y-auto max-h-[calc(75vh-60px)] custom-scrollbar">
                        {isLoadingProduct ? (
                            <div className="flex justify-center items-center py-4">
                                <BiLoaderCircle className="animate-spin text-blue-500" size={30} />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading product...</span>
                            </div>
                        ) : productError ? (
                            <div>
                                <p className="text-red-600 dark:text-red-400 mb-4">Error: {productError}</p>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">The product may have been deleted or is temporarily unavailable.</p>
                                {isCurrentUserPostCreator && (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleOpenAddModal}
                                            className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                                        >
                                            Add New Product
                                        </button>

                                        {primaryProductId && (
                                            <button
                                                onClick={async () => {
                                                    if (!postId) return;
                                                    try {
                                                        await updatePost(postId, { primary_product_id: null });
                                                        onClose();
                                                    } catch (error) {
                                                        console.error('Error unlinking product:', error);
                                                    }
                                                }}
                                                className="w-full bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
                                            >
                                                Unlink Missing Product
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : primaryProduct ? (
                            // Product Details Display
                            <div>
                                <div className="w-full aspect-square bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-5 overflow-hidden shadow-inner">
                                    {primaryProduct.imageId ? (
                                        <img
                                            src={useCreateBucketUrl(primaryProduct.imageId)}
                                            alt={primaryProduct.name}
                                            className="w-full h-full object-contain p-3"
                                            onError={(e) => {
                                                // Fallback to default image on error
                                                e.currentTarget.src = '/images/ii.png';
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src="/images/ii.png"
                                            alt="Default product image"
                                            className="w-full h-full object-contain p-3"
                                        />
                                    )}
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2 line-clamp-2 px-2">{primaryProduct.name}</h4>
                                <p className="text-[#F02C56] dark:text-[#FF4D79] font-bold text-xl mb-3 text-center">₹{primaryProduct.price.toFixed(2)}</p>

                                {/* Star Rating */}
                                <div className="mb-5">
                                    {renderStarRating(getProductRating(primaryProduct.id))}
                                </div>

                                {/* Add to Cart Button - Always show for all users */}
                                <div className="mb-4">
                                    <AddToCartButton
                                        product={primaryProduct}
                                        className="py-3 w-full font-medium text-base"
                                    />
                                </div>

                                {/* Shop Now Button - Always show for all users */}
                                {primaryProduct.product_url && (
                                    <div className="mb-4">
                                        <a
                                            href={primaryProduct.product_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-md text-center shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span>View Details</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </a>
                                    </div>
                                )}

                                {/* Creator-only actions */}
                                {isCurrentUserPostCreator && (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={handleOpenEditModal}
                                            className="flex-1 bg-blue-500 text-white px-3 py-2.5 rounded-md text-sm hover:bg-blue-600 font-medium shadow-sm transition-colors flex items-center justify-center"
                                        >
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={handleDeleteProduct}
                                            disabled={isProcessingDelete || isDeletingProduct || isUpdatingPost}
                                            className={`flex-1 bg-red-500 text-white px-3 py-2.5 rounded-md text-sm hover:bg-red-600 font-medium shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isProcessingDelete ? <BiLoaderCircle className="animate-spin mr-1" size={16} /> : null}
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                                {/* Combined Process Error Display */}
                                {processError && <p className="text-red-600 text-sm mt-2">Error: {processError}</p>}
                                {/* Specific Delete Error Display */}
                                {deleteError && !processError && <p className="text-red-600 text-sm mt-2">Error: {deleteError}</p>}
                            </div>
                        ) : isCurrentUserPostCreator ? (
                            // Creator View - No Product Linked
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">No product is linked to this video yet.</p>
                                <button onClick={handleOpenAddModal} className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
                                    Add Product
                                </button>
                            </div>
                        ) : (
                            // Public View - No Product Linked
                            <p className="text-gray-600 dark:text-gray-400">No product is linked to this video.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Render Add Product Modal conditionally */}
            {showAddModal && (
                <AddProductModal
                    postId={postId}
                    onClose={() => setShowAddModal(false)}
                    onProductAdded={() => {
                        refetchProduct();
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* Render Edit Product Modal conditionally */}
            {showEditModal && primaryProduct && (
                <EditProductModal
                    product={primaryProduct}
                    onClose={() => setShowEditModal(false)}
                    onProductUpdated={(updatedProduct) => {
                        refetchProduct();
                        setShowEditModal(false);
                    }}
                />
            )}
        </>
    );
};

export default ProductInfoModal;