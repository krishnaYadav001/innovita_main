import React, { useState, useEffect, useRef } from 'react';
import { BiSearch, BiFilterAlt, BiX } from 'react-icons/bi';
import { BsArrowDown, BsArrowUp, BsClock, BsHeart } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/theme';
import useSearchProfilesByName from '@/app/hooks/useSearchProfilesByName';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import Link from 'next/link';
import { RandomUsers } from '@/app/types';
import { debounce } from 'debounce';

// Define the filter types
type ContentType = 'all' | 'users' | 'products' | 'videos';
type SortBy = 'recent' | 'popular' | 'price_low' | 'price_high';
type PriceRange = 'all' | 'under50' | '50to100' | '100to200' | 'over200';

interface AdvancedSearchProps {
  className?: string;
}

export default function AdvancedSearch({ className = '' }: AdvancedSearchProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchProfiles, setSearchProfiles] = useState<RandomUsers[]>([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');

  // Handle search input change with debounce
  const handleSearchChange = debounce(async (value: string) => {
    setSearchTerm(value);

    if (value === '') {
      setSearchProfiles([]);
      return;
    }

    try {
      // For now, we're only searching users, but this can be expanded
      if (contentType === 'all' || contentType === 'users') {
        const result = await useSearchProfilesByName(value);
        if (result) setSearchProfiles(result);
      } else {
        // In the future, implement other search types
        setSearchProfiles([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchProfiles([]);
    }
  }, 500);

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search submission
  const handleSearch = () => {
    // Even if searchTerm is empty, we'll show all products with filters

    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('q', searchTerm);
    }
    params.append('type', contentType);
    params.append('sort', sortBy);

    if ((contentType === 'products' || contentType === 'all') && priceRange !== 'all') {
      params.append('price', priceRange);
    }

    // Navigate to search results page
    router.push(`/search?${params.toString()}`);

    // Close filters if open
    if (showFilters) {
      setShowFilters(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="flex items-center justify-end bg-[#F1F1F2] dark:bg-gray-700 p-1 rounded-full w-full">
        <input
          type="text"
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-3 my-2 bg-transparent text-black dark:text-white placeholder-[#838383] dark:placeholder-gray-400 text-[15px] focus:outline-none"
          placeholder="Search accounts, products, videos..."
        />

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-2 py-1 flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
          aria-label="Show search filters"
        >
          <BiFilterAlt
            className={`${showFilters ? 'text-[#F02C56]' : 'text-gray-500 dark:text-white'}`}
            size="20"
          />
        </button>

        {/* Search button */}
        <div
          onClick={handleSearch}
          className="px-3 py-1 flex items-center border-l border-l-gray-300 dark:border-l-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-full transition-colors"
        >
          <BiSearch className="text-gray-500 dark:text-white" size="22" />
        </div>
      </div>

      {/* Filter dropdown */}
      {showFilters && (
        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-black dark:text-white">Search Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <BiX size={20} />
            </button>
          </div>

          {/* Content Type Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2">
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

          {/* Sort By Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`py-1 px-2 rounded text-sm flex items-center justify-center ${
                  sortBy === 'recent'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BsClock className="mr-1" size={14} /> Most Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`py-1 px-2 rounded text-sm flex items-center justify-center ${
                  sortBy === 'popular'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BsHeart className="mr-1" size={14} /> Most Popular
              </button>
              <button
                onClick={() => setSortBy('price_low')}
                className={`py-1 px-2 rounded text-sm flex items-center justify-center ${
                  sortBy === 'price_low'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BsArrowUp className="mr-1" size={14} /> Price: Low to High
              </button>
              <button
                onClick={() => setSortBy('price_high')}
                className={`py-1 px-2 rounded text-sm flex items-center justify-center ${
                  sortBy === 'price_high'
                    ? 'bg-[#F02C56] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BsArrowDown className="mr-1" size={14} /> Price: High to Low
              </button>
            </div>
          </div>

          {/* Price Range Filter (only shown for products) */}
          {contentType === 'products' && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
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
            onClick={() => {
              setShowFilters(false);
              handleSearch();
            }}
            className="w-full py-2 bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium rounded transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Search Results Dropdown */}
      {searchProfiles.length > 0 && searchTerm && !showFilters && (
        <div className="absolute bg-white dark:bg-gray-800 max-w-full w-full z-20 left-0 top-12 border border-gray-200 dark:border-gray-700 p-1 rounded-md shadow-lg">
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Results
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {contentType === 'all' ? 'All Types' : contentType === 'users' ? 'Users' : contentType === 'products' ? 'Products' : 'Videos'}
            </span>
          </div>

          {searchProfiles.map((profile, index) => (
            <div className="p-1" key={index}>
              <Link
                href={`/profile/${profile?.id}`}
                className="flex items-center justify-between w-full cursor-pointer hover:bg-[#F12B56] dark:hover:bg-gray-600 p-1 px-2 hover:text-white dark:text-gray-200 rounded"
              >
                <div className="flex items-center">
                  <img
                    className="rounded-md"
                    width="40"
                    src={useCreateBucketUrl(profile?.image)}
                    alt={profile?.name}
                  />
                  <div className="ml-2">
                    <div className="truncate font-medium">{profile?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">User</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {/* View All Results Button */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSearch}
              className="w-full py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded transition-colors"
            >
              View All Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
