"use client";

import React, { useState } from 'react';
import { BiLoaderCircle } from 'react-icons/bi';
import useCreateProduct from '@/app/hooks/useCreateProduct'; // Use the create hook
import { Product } from '@/app/types';
import { useUser } from '@/app/context/user'; // Import user context

interface AddProductAdminModalProps {
    onClose: () => void; // Function to close the modal
    onProductAdded: (newProduct: Product) => void; // Callback after product is successfully added
}

const AddProductAdminModal: React.FC<AddProductAdminModalProps> = ({ onClose, onProductAdded }) => {
    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); // Use string for input
    const [url, setUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageDisplay, setImageDisplay] = useState<string | null>(null); // For image preview
    const [formError, setFormError] = useState<string | null>(null);

    // Hooks
    const { createProduct, isLoading: isCreatingProduct, error: createProductError } = useCreateProduct();
    const userContext = useUser(); // Get the whole context

    // Handle image selection and preview
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileUrl = URL.createObjectURL(file);
            setImageDisplay(fileUrl); // Show preview
            setImageFile(file);
        } else {
            setImageDisplay(null);
            setImageFile(null);
        }
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        // Basic validation
        if (!name || !price || !url || !imageFile) {
            setFormError("Please fill in all fields and select an image.");
            return;
        }

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            setFormError("Please enter a valid positive price.");
            return;
        }

        // Call the create product hook with user ID from context
        const newProduct = await createProduct(name, priceNumber, url, imageFile, userContext?.user?.id);

        if (newProduct) {
            onProductAdded(newProduct); // Notify parent component
            onClose(); // Close modal on success
        } else {
            // Handle product creation error
            setFormError(createProductError || "Failed to create the product.");
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
                    aria-label="Close add product form"
                    disabled={isCreatingProduct}
                >
                    &times; {/* Simple close icon */}
                </button>
                 {/* Added dark mode text */}
                <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Add New Product</h3>

                <form onSubmit={handleSubmit}>
                    {/* Product Name Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="addProductName" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            id="addProductName" type="text" maxLength={50} // Added maxLength
                            // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="Product Name (Max 50 chars)" disabled={isCreatingProduct} required
                        />
                    </div>
                    {/* Product Price Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="addProductPrice" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Price</label>
                        <input
                            id="addProductPrice" type="number" step="0.01" min="0.01"
                             // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={price} onChange={e => setPrice(e.target.value)}
                            placeholder="e.g., 29.99" disabled={isCreatingProduct} required
                        />
                    </div>
                    {/* Product URL Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="addProductUrl" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product URL</label>
                        <input
                            id="addProductUrl" type="url"
                             // Added dark mode styles
                            className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com/product-page" disabled={isCreatingProduct} required
                        />
                    </div>
                    {/* Product Image Input */}
                    <div className="mb-4">
                         {/* Added dark mode text */}
                        <label htmlFor="addProductImage" className="block text-[15px] mb-1 text-gray-700 dark:text-gray-300">Product Image</label>
                        {/* Styling file input for dark mode is tricky, keeping default for now */}
                        <input
                            id="addProductImage" type="file"
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-100 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 disabled:opacity-50"
                            onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" disabled={isCreatingProduct} required
                        />
                        {imageDisplay && (
                            <img src={imageDisplay} alt="Product preview" className="mt-2 rounded-md max-w-[100px] max-h-[100px] object-cover"/>
                        )}
                    </div>

                    {/* Error Display */}
                    {formError && (
                         <p className="text-red-600 text-sm mb-3">{formError}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreatingProduct}
                        className={`w-full flex items-center justify-center px-6 py-2 mt-2 border border-transparent text-[16px] text-white bg-green-600 dark:bg-gray-700 rounded-sm ${isCreatingProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 dark:hover:bg-gray-600'}`}
                    >
                        {isCreatingProduct ? (
                            <>
                                <BiLoaderCircle className="animate-spin mr-2" color="#ffffff" size={20} /> Creating...
                            </>
                        ) : (
                            'Add Product'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductAdminModal;