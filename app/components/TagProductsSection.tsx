"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { BiSearch, BiLoaderCircle } from 'react-icons/bi'; // Added BiLoaderCircle
import { AiOutlineClose } from 'react-icons/ai';
import { getDatabases, Query } from '@/libs/AppWriteClient'; // Use getter function
import debounce from 'lodash/debounce'; // Import debounce

interface TagProductsSectionProps {
    taggedProducts: Product[];
    setTaggedProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

// Removed mockProducts array
const TagProductsSection: React.FC<TagProductsSectionProps> = ({ taggedProducts, setTaggedProducts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false); // Added loading state

    // Debounced search function to avoid excessive API calls
    const debouncedSearch = debounce(async (term: string) => {
        if (term.trim() === '') {
            setSearchResults([]);
            setIsLoadingSearch(false);
            return;
        }
        setIsLoadingSearch(true);
        setSearchResults([]); // Clear previous results while loading new ones

        try {
            const response = await getDatabases().listDocuments(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_PRODUCT), // Use env variable for Product Collection ID
                [
                    Query.search('name', term), // Search by product name attribute
                    Query.limit(15) // Limit results
                ]
            );

            // Map Appwrite documents to Product type
            const products = response.documents.map(doc => ({
                id: doc.$id,
                name: doc.name,
                price: doc.price,
                image_url: doc.image_url,
                product_url: doc.product_url,
            })) as Product[];

            // Exclude already tagged products from the results
            const filteredProducts = products.filter(product =>
                !taggedProducts.some(tagged => tagged.id === product.id)
            );

            setSearchResults(filteredProducts);
        } catch (error) {
            console.error("Error searching products:", error);
            setSearchResults([]); // Clear results on error
            // Optionally: set an error state to display a message to the user
        } finally {
            setIsLoadingSearch(false);
        }
    }, 500); // Debounce time in milliseconds (e.g., 500ms)

    // Update search term state immediately, but trigger debounced API call
    const handleSearchInputChange = (term: string) => {
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const addProduct = (product: Product) => {
        if (!taggedProducts.some(p => p.id === product.id)) {
            setTaggedProducts([...taggedProducts, product]);
        }
        setSearchTerm('');
        setSearchResults([]);
        setShowSearch(false); // Optionally close search after adding
    };

    const removeProduct = (productId: string) => {
        setTaggedProducts(taggedProducts.filter(p => p.id !== productId));
    };

    return (
        <div className="mt-5 border-t pt-5">
            <h3 className="text-[15px] font-semibold mb-2">Tag Products (Optional)</h3>
            <p className="text-gray-500 text-[13px] mb-3">Link products from your shop to this post.</p>

            {/* Display Tagged Products */}
            {taggedProducts.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {taggedProducts.map(product => (
                        <div key={product.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                            <img src={product.image_url || '/images/placeholder.png'} alt={product.name} className="w-5 h-5 rounded-full mr-2 object-cover" />
                            <span>{product.name}</span>
                            <button onClick={() => removeProduct(product.id)} className="ml-2 text-gray-500 hover:text-red-500">
                                <AiOutlineClose size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Input and Button */}
            <div className="relative">
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="flex items-center justify-center w-full border p-2.5 rounded-md hover:bg-gray-50 text-sm mb-2"
                >
                    <BiSearch className="mr-2" /> Search and Tag Products
                </button>

                {showSearch && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => handleSearchInputChange(e.target.value)} // Use new handler
                                className="w-full border p-2 rounded-md focus:outline-none text-sm"
                            />
                        </div>
                        {isLoadingSearch && ( // Show loader while searching
                           <div className="flex justify-center items-center p-2">
                               <BiLoaderCircle className="animate-spin" size={20} />
                           </div>
                        )}
                        {searchResults.length > 0 ? (
                            <ul>
                                {searchResults.map(product => (
                                    <li
                                        key={product.id}
                                        onClick={() => addProduct(product)}
                                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        <img src={product.image_url || '/images/placeholder.png'} alt={product.name} className="w-8 h-8 rounded-md mr-3 object-cover" />
                                        <div>
                                            <div>{product.name}</div>
                                            <div className="text-xs text-gray-500">${product.price.toFixed(2)}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            !isLoadingSearch && searchTerm.trim() !== '' && <p className="p-2 text-sm text-gray-500">No products found.</p> // Show 'No products' only when not loading
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagProductsSection;