"use client";

import React, { useState, useEffect } from 'react';
import { ProductGridSkeleton } from '../loaders/SkeletonLoader';
import { BsShop } from 'react-icons/bs';
import Link from 'next/link';
import ProductUser from './ProductUser';
import useGetProductsByUserId from '@/app/hooks/useGetProductsByUserId';
import { useUser } from '@/app/context/user';

interface ProductsTabProps {
  userId: string;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ userId }) => {
  const { products, isLoading, error, refetchProducts } = useGetProductsByUserId(userId);
  const contextUser = useUser();
  const isCurrentUser = contextUser?.user?.id === userId;
  const [retryCount, setRetryCount] = useState(0);

  // Log component state for debugging
  useEffect(() => {
    console.log('ProductsTab rendered with:', {
      userId,
      productsCount: products.length,
      isLoading,
      error,
      retryCount
    });
  }, [userId, products.length, isLoading, error, retryCount]);

  const handleRetry = () => {
    console.log('Retrying product fetch...');
    setRetryCount(prev => prev + 1);
    refetchProducts();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <ProductGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold mb-2 text-center">Error loading products</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium py-2 px-6 rounded-full transition-colors flex items-center"
        >
          {isLoading ? (
            <>
              <BiLoaderCircle className="animate-spin mr-2" size={20} />
              Retrying...
            </>
          ) : (
            'Retry'
          )}
        </button>
        {isCurrentUser && (
          <div className="mt-4 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Make sure you've linked products to your videos.
            </p>
            <Link href="/upload" className="text-[#F02C56] hover:underline">
              Upload a video with products
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-6xl mb-4"><BsShop size={60} /></div>
        <h3 className="text-2xl font-bold mb-2 text-center">No products yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          {isCurrentUser ?
            "When you link products to your videos, they'll appear here." :
            "This user hasn't linked any products to their videos yet."}
        </p>
        {isCurrentUser && (
          <Link href="/upload" className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium py-2 px-6 rounded-full transition-colors">
            Upload a video with products
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 animate-fadeIn">
      {products.map((product) => (
        <div
          key={product.id}
          className="transform hover:-translate-y-1 transition-transform duration-200"
        >
          <ProductUser product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductsTab;
