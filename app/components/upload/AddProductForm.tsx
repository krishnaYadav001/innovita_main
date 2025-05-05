"use client"

import React from 'react';
// Removed BiLoaderCircle as save logic is moved

interface AddProductFormProps {
    newProductName: string;
    setNewProductName: (value: string) => void;
    newProductPrice: string;
    setNewProductPrice: (value: string) => void;
    newProductUrl: string;
    setNewProductUrl: (value: string) => void;
    newProductImageDisplay: string;
    onProductImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    // Removed props related to save state/handlers
    isUploading: boolean; // To disable fields if post is uploading
}

const AddProductForm: React.FC<AddProductFormProps> = ({
    newProductName,
    setNewProductName,
    newProductPrice,
    setNewProductPrice,
    newProductUrl,
    setNewProductUrl,
    newProductImageDisplay,
    onProductImageChange,
    isUploading,
}) => {
    // Removed internal collapsible state

    return (
        // Removed collapsible container and button
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 dark:border dark:border-gray-700">
             <h3 className="text-[16px] font-semibold mb-3 text-black dark:text-white">Link Primary Product (Optional)</h3>
             <p className="text-gray-500 dark:text-gray-300 text-[13px] mb-4">Add product details below. If filled, this product will be created and linked to the video.</p>

            {/* Product Name Input */}
            <div className="mb-4">
                <label htmlFor="newProductName" className="block text-[15px] mb-1 text-black dark:text-white">Product Name</label>
                <input
                    id="newProductName"
                    type="text"
                    className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    placeholder="e.g., Stylish T-Shirt (Max 50 chars)"
                    maxLength={50} // Added maxLength validation
                    disabled={isUploading} // Disable if post is uploading
                />
            </div>

            {/* Product Price Input */}
            <div className="mb-4">
                <label htmlFor="newProductPrice" className="block text-[15px] mb-1 text-black dark:text-white">Price</label>
                <input
                    id="newProductPrice"
                    type="number"
                    step="0.01"
                    className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                    placeholder="e.g., 29.99"
                    disabled={isUploading} // Disable if post is uploading
                />
            </div>

            {/* Product URL Input */}
            <div className="mb-4">
                <label htmlFor="newProductUrl" className="block text-[15px] mb-1 text-black dark:text-white">Product URL</label>
                <input
                    id="newProductUrl"
                    type="url"
                    className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={newProductUrl}
                    onChange={e => setNewProductUrl(e.target.value)}
                    placeholder="e.g., /shop/product/stylish-t-shirt or https://..."
                    disabled={isUploading} // Disable if post is uploading
                />
            </div>

            {/* Product Image Input */}
            <div className="mb-4">
                <label htmlFor="newProductImage" className="block text-[15px] mb-1 text-black dark:text-white">Product Image</label>
                <input
                    id="newProductImage"
                    type="file"
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 dark:file:bg-violet-900 dark:file:text-violet-300 hover:file:bg-violet-100 dark:hover:file:bg-violet-800 disabled:opacity-50"
                    onChange={onProductImageChange}
                    accept="image/png, image/jpeg, image/webp"
                    disabled={isUploading} // Disable if post is uploading
                />
                {/* Image Preview */}
                {newProductImageDisplay && (
                    <img src={newProductImageDisplay} alt="Product preview" className="mt-2 rounded-md max-w-[150px] max-h-[150px] object-cover"/>
                )}
            </div>
             {/* Removed Save Button and status messages */}
        </div>
    );
};

export default AddProductForm;