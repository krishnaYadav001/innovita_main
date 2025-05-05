"use client";

import React from 'react';
import { Product } from '../types'; // Import the Product type
import { AiOutlineClose } from 'react-icons/ai'; // Import close icon

interface TaggedProductsOverlayProps {
  products: Product[];
  onClose: () => void; // Function to close the overlay
}

export default function TaggedProductsOverlay({ products, onClose }: TaggedProductsOverlayProps) {
  if (!products || products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    // Using fixed positioning to overlay the entire component area
    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4 rounded-xl">
      <div className="bg-white rounded-lg shadow-xl p-5 max-w-xs w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-50"
          aria-label="Close product overlay"
        >
          <AiOutlineClose size={22} />
        </button>
        <h3 className="text-md font-semibold mb-3 text-center border-b pb-2">Products in this post</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-2 border rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <img
                src={product.image_url || '/images/ii.png'} // Updated Fallback image
                alt={product.name}
                className="w-10 h-10 object-cover rounded flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }} // Updated Handle broken image links
              />
              <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation */}
                <p className="text-sm font-medium truncate">{product.name}</p> {/* Added truncate */}
                <p className="text-xs text-gray-600">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}