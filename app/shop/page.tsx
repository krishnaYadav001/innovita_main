"use client";

import MainLayout from "../layouts/MainLayout";
import React, { useEffect } from 'react';
import useGetAllProducts from '../hooks/useGetAllProducts';
import useCreateBucketUrl from '../hooks/useCreateBucketUrl';
import { BiRefresh } from 'react-icons/bi';
import { ProductGridSkeleton } from '../components/loaders/SkeletonLoader';
import { useTheme } from '../context/theme';
import AddToCartButton from '../components/AddToCartButton';
import { useCartStore } from '../stores/cart';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';
import ProductUserAvatar from '../components/ProductUserAvatar';
import EmptyState from '../components/EmptyState';

export default function Shop() {
    const { products, isLoading, error, refetchProducts } = useGetAllProducts();
    const { theme } = useTheme();
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
            <div className="flex space-x-1">
                {stars}
            </div>
        )
    }

    // Get average rating for a product from cart items
    const getProductRating = (productId: string) => {
        const cartItem = items.find(item => item.id === productId)
        return cartItem?.rating || 0
    }

    useEffect(() => {
        refetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <MainLayout>
      <div className="pt-[80px] w-full px-4 sm:px-6 lg:px-8 bg-white dark:bg-black min-h-screen">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">Shop Our Products</h1>
            <button
                onClick={() => refetchProducts()}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Refresh products"
            >
                <BiRefresh size={24} className={`${isLoading ? 'animate-spin' : ''} text-black dark:text-white`} />
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
                    {isLoading ? (
                      <div className="col-span-full">
                        <ProductGridSkeleton count={8} />
                      </div>
                    ) : error ? (
                      <p className="col-span-full text-red-600 text-center py-10 text-lg">Error loading products: {error}</p>
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <div key={product.id} className="group border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden transform hover:-translate-y-1">
                          <div className="w-full h-48 sm:h-56 overflow-hidden relative">
                            <img
                              src={product.imageId ? useCreateBucketUrl(product.imageId) : '/images/ii.png'}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
                            />
                            {/* User Avatar */}
                            {product.user_id && (
                              <div className="absolute bottom-2 left-2 shadow-md rounded-full border-2 border-white dark:border-gray-800">
                                <ProductUserAvatar userId={product.user_id} size="md" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow w-full flex flex-col items-center text-center p-4 min-h-[100px]">
                              <h2 className="text-lg sm:text-xl font-semibold mb-2 truncate w-full px-1 text-gray-900 dark:text-white">{product.name}</h2>
                              <p className="text-md sm:text-lg font-bold text-[#F02C56] dark:text-[#FF4D79] mb-2">₹{product.price.toFixed(2)}</p>

                              {/* Star Rating */}
                              <div className="mb-4">
                                {renderStarRating(getProductRating(product.id))}
                              </div>
                          </div>
                          <div className="w-full px-4 pb-4 flex gap-2">
                            <a
                              href={product.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-md text-center transition-colors duration-200"
                            >
                              View Details
                            </a>

                            <AddToCartButton
                              product={product}
                              className="py-3 px-4 font-bold"
                              showText={false}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10">
                        <EmptyState
                          type="products"
                          title="No products available yet"
                          message="The product catalog is currently empty. Check back later for exciting products!"
                          actionText="Refresh"
                          actionLink="#"
                          icon={BsShop}
                        />
                      </div>
                    )}
        </div>
      </div>
    </MainLayout>
  );
}