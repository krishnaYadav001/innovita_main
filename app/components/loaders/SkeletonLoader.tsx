"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base skeleton component with shimmer effect
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative ${className}`}
      style={style}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" 
        style={{ backgroundSize: '200% 100%' }}
      />
    </div>
  );
};

// Product card skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-2 flex flex-col items-center text-center bg-white dark:bg-gray-800 overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-32 mb-2" />
      
      {/* Title skeleton */}
      <Skeleton className="w-4/5 h-4 mb-2" />
      
      {/* Price skeleton */}
      <Skeleton className="w-1/3 h-3" />
    </div>
  );
};

// User item skeleton
export const UserItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
      {/* Avatar skeleton */}
      <Skeleton className="w-10 h-10 rounded-full" />
      
      {/* User info skeleton */}
      <div className="ml-3 flex-1">
        <Skeleton className="w-24 h-4 mb-1" />
        <Skeleton className="w-16 h-3" />
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="w-20 h-8 rounded-md" />
    </div>
  );
};

// Post skeleton
export const PostSkeleton: React.FC = () => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 py-4">
      {/* User avatar skeleton */}
      <Skeleton className="w-12 h-12 rounded-full" />
      
      <div className="ml-3 flex-1">
        {/* User name and timestamp skeleton */}
        <div className="flex items-center">
          <Skeleton className="w-24 h-4 mr-2" />
          <Skeleton className="w-16 h-3" />
        </div>
        
        {/* Post content skeleton */}
        <Skeleton className="w-full h-4 mt-2 mb-1" />
        <Skeleton className="w-3/4 h-4 mb-3" />
        
        {/* Video placeholder skeleton */}
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    </div>
  );
};

// Comment skeleton
export const CommentSkeleton: React.FC = () => {
  return (
    <div className="flex items-start py-3">
      {/* User avatar skeleton */}
      <Skeleton className="w-8 h-8 rounded-full" />
      
      <div className="ml-3 flex-1">
        {/* User name skeleton */}
        <Skeleton className="w-20 h-3.5 mb-1" />
        
        {/* Comment text skeleton */}
        <Skeleton className="w-full h-3 mb-1" />
        <Skeleton className="w-4/5 h-3" />
      </div>
    </div>
  );
};

// Profile header skeleton
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center">
      {/* Profile image skeleton */}
      <Skeleton className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full" />
      
      <div className="mt-6 sm:mt-0 sm:ml-8 w-full">
        {/* Name skeleton */}
        <Skeleton className="w-40 h-8 mb-2" />
        
        {/* Username skeleton */}
        <Skeleton className="w-32 h-4 mb-4" />
        
        {/* Bio skeleton */}
        <Skeleton className="w-full max-w-md h-4 mb-1" />
        <Skeleton className="w-3/4 max-w-md h-4 mb-1" />
        <Skeleton className="w-1/2 max-w-md h-4 mb-4" />
        
        {/* Stats skeleton */}
        <div className="flex space-x-4">
          <Skeleton className="w-16 h-12 rounded" />
          <Skeleton className="w-16 h-12 rounded" />
          <Skeleton className="w-16 h-12 rounded" />
        </div>
      </div>
    </div>
  );
};

// Button with loading state
export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ isLoading, children, className = '', onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`relative ${className} ${isLoading ? 'text-transparent' : ''}`}
    >
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

// Grid of product card skeletons
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
    </div>
  );
};

// List of user item skeletons
export const UserListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, index) => (
        <UserItemSkeleton key={`user-skeleton-${index}`} />
      ))}
    </div>
  );
};

// Feed of post skeletons
export const PostFeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, index) => (
        <PostSkeleton key={`post-skeleton-${index}`} />
      ))}
    </div>
  );
};

// List of comment skeletons
export const CommentListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <CommentSkeleton key={`comment-skeleton-${index}`} />
      ))}
    </div>
  );
};
