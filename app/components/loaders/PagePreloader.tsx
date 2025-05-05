"use client";

import React from 'react';
import { Skeleton } from './SkeletonLoader';

interface PagePreloaderProps {
  type?: 'profile' | 'upload' | 'default';
}

const PagePreloader: React.FC<PagePreloaderProps> = ({ type = 'default' }) => {
  if (type === 'profile') {
    return (
      <div className="w-full max-w-[1800px] mx-auto animate-fadeIn">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row w-full">
            {/* Profile Image */}
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] min-w-[120px] sm:min-w-[140px] bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:mx-0 border-4 border-white dark:border-gray-800 shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
            
            <div className="mt-6 sm:mt-0 sm:ml-8 w-full text-center sm:text-left">
              {/* Name and Username */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                </div>
                <div className="mb-4 sm:mb-0">
                  <Skeleton className="h-10 w-28 rounded-md mx-auto sm:mx-0" />
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-3 mb-4 max-w-[500px]">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              {/* Stats */}
              <div className="inline-flex items-center mt-4 mb-4 bg-gray-50 dark:bg-gray-800/50 py-2 px-3 rounded-lg mx-auto sm:mx-0 shadow-sm divide-x divide-gray-200 dark:divide-gray-700 w-full max-w-md">
                <div className="text-center px-5 flex-1">
                  <Skeleton className="h-6 w-8 mb-1 mx-auto" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="text-center px-5 flex-1">
                  <Skeleton className="h-6 w-8 mb-1 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="text-center px-5 flex-1">
                  <Skeleton className="h-6 w-8 mb-1 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
          <div className="flex items-center">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-md overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'upload') {
    return (
      <div className="w-full mt-[80px] mb-[40px] bg-white dark:bg-gray-900 shadow-lg rounded-md py-6 md:px-10 px-4 dark:border dark:border-gray-800 animate-fadeIn">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-64 mb-8" />
        </div>
        
        <div className="md:flex gap-6">
          {/* Video Upload Area */}
          <div className="md:w-[260px] w-full">
            <div className="mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-[260px] h-[470px] text-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
          </div>
          
          {/* Form Area */}
          <div className="mt-4 mb-6 flex-grow">
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 dark:border dark:border-gray-700">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-6" />
              
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              
              <div className="flex items-center justify-center w-full h-32 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default preloader
  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="w-full h-48 rounded-lg mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagePreloader;
