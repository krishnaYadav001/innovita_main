"use client";

import React from 'react';
import { Product } from '../../types';
import useGetRandomProducts from '@/app/hooks/useGetRandomProducts';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import { BiLoaderCircle, BiX } from 'react-icons/bi';
import AddToCartButton from '@/app/components/AddToCartButton';
import { useCartStore } from '@/app/stores/cart';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface RelatedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryProductId?: string | null; // Pass the current post's primary product ID to exclude it
}

export default function RelatedProductsModal({ isOpen, onClose, primaryProductId }: RelatedProductsModalProps) {
  // Use our custom hook to fetch random products
  const { products: relatedProducts, isLoading, error } = useGetRandomProducts(3, primaryProductId);
  // Get cart items to check for ratings
  const { items } = useCartStore();

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    const stars = []

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-yellow-400" size={12} />)
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" size={12} />)
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" size={12} />)
      }
    }

    return (
      <div className="flex space-x-0.5">
        {stars}
      </div>
    )
  }

  // Get rating for a product from cart items
  const getProductRating = (productId: string) => {
    const cartItem = items.find(item => item.id === productId)
    return cartItem?.rating || 0
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <BiX size={24} />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">You Might Also Like</h3>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="border dark:border-gray-700 rounded-lg p-2 flex flex-col items-center text-center bg-white dark:bg-gray-800 overflow-hidden"
              >
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
                <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
                <div className="w-1/3 h-3 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <p className="text-red-500 dark:text-red-400">Error loading related products.</p>
        )}

        {/* Products Grid */}
        {!isLoading && !error && relatedProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="border dark:border-gray-700 rounded-lg p-2 flex flex-col items-center text-center hover:shadow-md dark:hover:shadow-gray-700 transition-shadow duration-150 ease-in-out bg-white dark:bg-gray-800"
              >
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded mb-2 overflow-hidden">
                  {product.imageId ? (
                    <img
                      src={useCreateBucketUrl(product.imageId)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
                    />
                  ) : (
                    <img
                      src={product.image_url || '/images/ii.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
                    />
                  )}
                </div>
                <p className="text-sm font-medium flex-grow text-black dark:text-white line-clamp-1">{product.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">₹{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                <div className="mt-1 mb-2">
                  {renderStarRating(getProductRating(product.id))}
                </div>
                <div className="flex w-full gap-2 mt-1">
                  <AddToCartButton
                    product={product}
                    className="py-1 px-2 text-xs flex-1"
                    showText={false}
                  />
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs py-1 px-2 rounded-md"
                  >
                    Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products State */}
        {!isLoading && !error && relatedProducts.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">No related products found.</p>
        )}
      </div>
    </div>
  );
}