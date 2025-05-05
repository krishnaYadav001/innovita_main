"use client";

import React from 'react';
import { Product } from '@/app/types';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import Link from 'next/link';

interface ProductUserProps {
  product: Product;
}

const ProductUser: React.FC<ProductUserProps> = ({ product }) => {
  return (
    <Link href={product.product_url} target="_blank" rel="noopener noreferrer">
      <div className="group border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden transform hover:-translate-y-1 h-full">
        <div className="w-full aspect-square overflow-hidden">
          <img
            src={product.imageId ? useCreateBucketUrl(product.imageId) : '/images/ii.png'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
          />
        </div>
        <div className="flex-grow w-full flex flex-col items-center text-center p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-[#F02C56] font-semibold">${product.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductUser;
