import React from 'react';
import { BiX } from 'react-icons/bi';

// Define the filter types
type ContentType = 'all' | 'users' | 'products' | 'videos';
type SortBy = 'recent' | 'popular' | 'price_low' | 'price_high';
type PriceRange = 'all' | 'under50' | '50to100' | '100to200' | 'over200';

interface SearchFilterProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  onApplyFilters: () => void;
}

export default function SearchFilter({
  isOpen,
  onClose,
  contentType,
  setContentType,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  onApplyFilters
}: SearchFilterProps) {

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 sm:top-14 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30 p-3 sm:p-4">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className="font-semibold text-black dark:text-white text-sm sm:text-base">Search Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close filters"
        >
          <BiX size={18} />
        </button>
      </div>

      {/* Content Type Filter */}
      <div className="mb-2 sm:mb-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
          <button
            onClick={() => setContentType('all')}
            className={`py-1 px-2 rounded text-sm ${
              contentType === 'all'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setContentType('users')}
            className={`py-1 px-2 rounded text-sm ${
              contentType === 'users'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setContentType('products')}
            className={`py-1 px-2 rounded text-sm ${
              contentType === 'products'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setContentType('videos')}
            className={`py-1 px-2 rounded text-sm ${
              contentType === 'videos'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Sort By Filter - Contextual based on content type */}
      <div className="mb-2 sm:mb-3">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sort By
        </label>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
          {/* Recent option - available for all content types */}
          <button
            onClick={() => setSortBy('recent')}
            className={`py-1 px-2 rounded text-sm ${
              sortBy === 'recent'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Most Recent
          </button>

          {/* Popular option - available for all content types */}
          <button
            onClick={() => setSortBy('popular')}
            className={`py-1 px-2 rounded text-sm ${
              sortBy === 'popular'
                ? 'bg-[#F02C56] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Most Popular
          </button>

          {/* Price options - only for products or all */}
          {(contentType === 'products' || contentType === 'all') && (
            <>
              <button
                onClick={() => setSortBy('price_low')}
                className={`py-1 px-2 rounded text-sm ${
                  sortBy === 'price_low'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => setSortBy('price_high')}
                className={`py-1 px-2 rounded text-sm ${
                  sortBy === 'price_high'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Price: High to Low
              </button>
            </>
          )}
        </div>
      </div>

      {/* Price Range Filter (only shown for products) */}
      {(contentType === 'products' || contentType === 'all') && (
        <div className="mb-2 sm:mb-3">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Range
          </label>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
            <button
              onClick={() => setPriceRange('all')}
              className={`py-1 px-2 rounded text-sm ${
                priceRange === 'all'
                  ? 'bg-[#F02C56] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceRange('under50')}
              className={`py-1 px-2 rounded text-sm ${
                priceRange === 'under50'
                  ? 'bg-[#F02C56] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Under ₹50
            </button>
            <button
              onClick={() => setPriceRange('50to100')}
              className={`py-1 px-2 rounded text-sm ${
                priceRange === '50to100'
                  ? 'bg-[#F02C56] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              ₹50 - ₹100
            </button>
            <button
              onClick={() => setPriceRange('100to200')}
              className={`py-1 px-2 rounded text-sm ${
                priceRange === '100to200'
                  ? 'bg-[#F02C56] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              ₹100 - ₹200
            </button>
            <button
              onClick={() => setPriceRange('over200')}
              className={`py-1 px-2 rounded text-sm ${
                priceRange === 'over200'
                  ? 'bg-[#F02C56] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Over ₹200
            </button>
          </div>
        </div>
      )}

      {/* Apply Filters Button */}
      <button
        onClick={onApplyFilters}
        className="w-full py-1.5 sm:py-2 bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium rounded text-sm sm:text-base transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
