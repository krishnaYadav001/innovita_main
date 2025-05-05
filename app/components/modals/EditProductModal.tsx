"use client"

import React, { useState, useEffect } from 'react';
import { BiLoaderCircle } from 'react-icons/bi';
import useUpdateProduct from '@/app/hooks/useUpdateProduct';
import { Product } from '@/app/types';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'; // Import hook to display initial image

interface EditProductModalProps {
    product: Product; // Product data to pre-fill the form
    onClose: () => void; // Function to close the modal
    onProductUpdated: (updatedProduct: Product) => void; // Callback after product is successfully updated
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onProductUpdated }) => {
    // Form State - Initialize with existing product data
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString()); // Use string for input
    const [url, setUrl] = useState(product.product_url);
    const [imageFile, setImageFile] = useState<File | null>(null); // For uploading a new image
    // Use useCreateBucketUrl for initial display if imageId exists
    const initialImageUrl = product.imageId ? useCreateBucketUrl(product.imageId) : '/images/ii.png'; // Fallback image
    const [imageDisplay, setImageDisplay] = useState<string>(initialImageUrl); // Show current image initially
    const [formError, setFormError] = useState<string | null>(null);

    // Hook
    const { updateProduct, isLoading: isUpdatingProduct, error: updateProductError } = useUpdateProduct();

    // Update image preview if a new file is selected
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileUrl = URL.createObjectURL(file);
            setImageDisplay(fileUrl); // Show preview of new image
            setImageFile(file);
        } else {
            // If user cancels file selection, revert preview to original image
            setImageDisplay(initialImageUrl); // Revert to initial URL
            setImageFile(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            setFormError("Please enter a valid positive price.");
            return;
        }

        // Prepare update data - only include changed fields
        const updateData: any = {};
        if (name !== product.name) updateData.name = name;
        if (priceNumber !== product.price) updateData.price = priceNumber;
        if (url !== product.product_url) updateData.product_url = url;
        if (imageFile) {
             updateData.imageFile = imageFile;
             updateData.currentImageId = product.imageId; // Pass current image ID for deletion
        }

        if (Object.keys(updateData).length === 0) {
            setFormError("No changes detected.");
            return; // No need to call update if nothing changed
        }


        const updatedProduct = await updateProduct(product.id, updateData);

        if (updatedProduct) {
            onProductUpdated(updatedProduct); // Notify parent component
            onClose(); // Close modal on success
        } else {
            // Handle product update error
            setFormError(updateProductError || "Failed to update the product.");
        }
    };

    return (
        // Modal backdrop
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
             {/* Modal Content - Added dark mode background */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full relative">
                <button
                    onClick={onClose}
                     // Added dark mode text/hover
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    aria-label="Close edit product form"
                    disabled={isUpdatingProduct}
                >
                    &times; {/* Simple close icon */}
                </button>
                 {/* Added dark mode text */}
                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Edit Product</h3>

                <form onSubmit={handleSubmit}>
                    {/* Product Name Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="editProductName" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            id="editProductName" type="text" maxLength={50}
                             // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="e.g., Stylish T-Shirt" disabled={isUpdatingProduct}
                        />
                    </div>
                    {/* Product Price Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="editProductPrice" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Price</label>
                        <input
                            id="editProductPrice" type="number" step="0.01" min="0.01"
                             // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={price} onChange={e => setPrice(e.target.value)}
                            placeholder="e.g., 29.99" disabled={isUpdatingProduct}
                        />
                    </div>
                    {/* Product URL Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="editProductUrl" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product URL</label>
                        <input
                            id="editProductUrl" type="url"
                             // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="e.g., /shop/product/stylish-t-shirt or https://..." disabled={isUpdatingProduct}
                        />
                    </div>
                    {/* Product Image Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="editProductImage" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product Image (Optional: Upload new to replace)</label>
                        {/* Styling file input for dark mode */}
                        <input
                            id="editProductImage" type="file"
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-100 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 disabled:opacity-50"
                            onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" disabled={isUpdatingProduct}
                        />
                        {imageDisplay && (
                            <div className="mt-2 rounded-md w-[150px] h-[150px] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden p-2">
                                <img src={imageDisplay} alt="Product preview" className="max-h-[140px] w-auto max-w-full object-contain"/>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {formError && (
                         <p className="text-red-600 text-sm mb-3">{formError}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isUpdatingProduct}
                        className={`w-full flex items-center justify-center px-6 py-2 mt-2 border border-transparent text-[16px] text-white bg-blue-600 dark:bg-gray-700 rounded-sm ${isUpdatingProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 dark:hover:bg-gray-600'}`}
                    >
                        {isUpdatingProduct ? (
                            <>
                                <BiLoaderCircle className="animate-spin mr-2" color="#ffffff" size={20} /> Updating...
                            </>
                        ) : (
                            'Update Product'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;