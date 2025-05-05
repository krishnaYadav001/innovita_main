"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../layouts/MainLayout';
import useGetAllProducts from '../hooks/useGetAllProducts';
import useGetPostsForSearch from '../hooks/useGetPostsForSearch';
import useGetAllUsers from '../hooks/useGetAllUsers';
import useCreateBucketUrl from '../hooks/useCreateBucketUrl';
import sortPostsByUserPopularity from '../hooks/useGetUserPopularity';
import sortUsersByPopularity from '../hooks/useGetUsersByPopularity';
import { BiSearch, BiPlay } from 'react-icons/bi';
import { ProductGridSkeleton, UserListSkeleton, PostFeedSkeleton } from '../components/loaders/SkeletonLoader';
import { AiOutlineEye, AiOutlineHeart } from 'react-icons/ai';
import Link from 'next/link';
import { useTheme } from '../context/theme';
import { Product, PostWithProfile } from '../types';
import { User } from '../hooks/useGetAllUsers';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  // Get search parameters
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const sort = searchParams.get('sort') || 'recent';
  const priceRange = searchParams.get('price') || 'all';

  // State for filtered results
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isFiltering, setIsFiltering] = useState(true);

  // Get all products, posts (videos), and users
  const { products, isLoading: productsLoading, error: productsError } = useGetAllProducts();
  const { posts, isLoading: postsLoading, error: postsError } = useGetPostsForSearch();
  const { users, isLoading: usersLoading, error: usersError } = useGetAllUsers();

  // Combined loading and error states
  const isLoading = productsLoading || postsLoading || usersLoading;
  const error = productsError || postsError || usersError;

  // Filter and sort products based on search parameters
  useEffect(() => {
    // Create an async function inside useEffect
    const filterAndSortData = async () => {
      if (isLoading || error) return;

      setIsFiltering(true);

      // Handle different content types
      if (type === 'users') {
        if (!users.length) {
          setFilteredUsers([]);
          setFilteredProducts([]);
          setFilteredPosts([]);
          setIsFiltering(false);
          return;
        }

        // Filter users by search query
        let filtered = [...users];
        if (query) {
          filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            (user.bio && user.bio.toLowerCase().includes(query.toLowerCase()))
          );
        }

        // Sort users
        if (sort === 'popular') {
          // Sort by user popularity (total likes received)
          try {
            filtered = await sortUsersByPopularity(filtered);
          } catch (error) {
            console.error('Error sorting users by popularity:', error);
            // Fallback to recent sort if there's an error
            if (filtered[0]?.createdAt) {
              filtered.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA; // Most recent first
              });
            }
          }
        } else if (sort === 'recent') {
          // Sort by creation date (most recent first)
          if (filtered[0]?.createdAt) {
            filtered.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA; // Most recent first
            });
          }
        }

        setFilteredUsers(filtered);
        setFilteredProducts([]);
        setFilteredPosts([]);
        setIsFiltering(false);
        return;
      }

      // Handle video search
      if (type === 'videos') {
        if (!posts.length) {
          setFilteredPosts([]);
          setIsFiltering(false);
          return;
        }

        // Filter posts (videos) by search query
        let filtered = [...posts];
        if (query) {
          filtered = filtered.filter(post =>
            post.text.toLowerCase().includes(query.toLowerCase())
          );
        }

        // Sort posts (videos)
        if (sort === 'popular') {
          // For videos, 'popular' means sorting by user popularity (likes received by the user)
          try {
            filtered = await sortPostsByUserPopularity(filtered);
          } catch (error) {
            console.error('Error sorting by user popularity:', error);
            // Fallback to recent sort if there's an error
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        } else if (sort === 'recent') {
          // Sort by creation date (most recent first)
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        setFilteredPosts(filtered);
        setFilteredProducts([]);
        setIsFiltering(false);
        return;
      }

      // If there are no products, show empty state
      if (!products.length) {
        setFilteredProducts([]);
        setIsFiltering(false);
        return;
      }

      // Filter by search query
      let filtered = [...products];
      if (query) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Filter by price range
      if (priceRange === 'under50') {
        filtered = filtered.filter(product => product.price < 50);
      } else if (priceRange === '50to100') {
        filtered = filtered.filter(product => product.price >= 50 && product.price <= 100);
      } else if (priceRange === '100to200') {
        filtered = filtered.filter(product => product.price > 100 && product.price <= 200);
      } else if (priceRange === 'over200') {
        filtered = filtered.filter(product => product.price > 200);
      }

      // Sort results
      if (sort === 'price_low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'popular') {
        // For now, we don't have popularity data, so we'll just use the default sort
        // In the future, this could be based on likes or views
      } else {
        // Default is 'recent' - products are already sorted by creation date
      }

      setFilteredProducts(filtered);
      setIsFiltering(false);
    };

    // Call the async function
    filterAndSortData();
  }, [products, posts, users, query, type, sort, priceRange, isLoading, error]);

  return (
    <MainLayout>
      <div className="pt-[80px] w-full px-4 sm:px-6 lg:px-8 bg-white dark:bg-black min-h-screen">
        {/* Search Header */}
        <div className="flex flex-col mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {type === 'videos' ? 'Video Search' :
             type === 'users' ? 'User Search' :
             type === 'products' ? 'Product Search' : 'Search Results'}
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <BiSearch size={18} className="mr-2" />
            <p>
              {query ? (
                <>
                  Results for <span className="font-semibold">"{query}"</span>
                </>
              ) : (
                type === 'videos' ?
                  sort === 'recent' ? 'Showing most recent videos' :
                  sort === 'popular' ? 'Showing videos from popular creators' :
                  `Showing videos sorted by ${sort.replace('_', ' ')}` :
                type === 'users' ?
                  sort === 'recent' ? 'Showing most recent users' :
                  sort === 'popular' ? 'Showing most popular users' :
                  `Showing users sorted by ${sort.replace('_', ' ')}` :
                sort === 'recent' ? 'Showing most recent products' :
                sort === 'popular' ? 'Showing most popular products' :
                sort === 'price_low' ? 'Showing products by price: low to high' :
                sort === 'price_high' ? 'Showing products by price: high to low' :
                `Showing products sorted by ${sort.replace('_', ' ')}`
              )}
            </p>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            {type !== 'all' && (
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 flex items-center">
                Type: {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            )}

            {sort !== 'recent' && (
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 flex items-center">
                Sort: {sort === 'popular' ? 'Most Popular' :
                       sort === 'price_low' ? 'Price: Low to High' :
                       sort === 'price_high' ? 'Price: High to Low' :
                       sort.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}

            {priceRange !== 'all' && type !== 'users' && type !== 'videos' && (
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 flex items-center">
                Price: {priceRange === 'under50' ? 'Under ₹50' :
                        priceRange === '50to100' ? '₹50 - ₹100' :
                        priceRange === '100to200' ? '₹100 - ₹200' :
                        'Over ₹200'}
              </div>
            )}

            {/* Clear Filters Link */}
            {(type !== 'all' || sort !== 'recent' || priceRange !== 'all') && (
              <Link
                href={`/search?q=${query}`}
                className="text-[#F02C56] hover:underline text-sm ml-2 flex items-center"
              >
                Clear filters
              </Link>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {isLoading || isFiltering ? (
            <div className="col-span-full">
              {type === 'users' ? (
                <UserListSkeleton count={8} />
              ) : type === 'videos' ? (
                <PostFeedSkeleton count={8} />
              ) : (
                <ProductGridSkeleton count={8} />
              )}
            </div>
          ) : error ? (
            <p className="col-span-full text-red-600 text-center py-10 text-lg">Error loading products: {error}</p>
          ) : type === 'users' ? (
            filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="group border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden transform hover:-translate-y-1">
                  <Link href={`/profile/${user.user_id}`} className="w-full">
                    <div className="flex flex-col items-center p-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                        <img
                          src={useCreateBucketUrl(user.image) || '/images/placeholder-user.jpg'}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-user.jpg'; }}
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">{user.name}</h2>
                      {user.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-3 mb-4">{user.bio}</p>
                      )}
                      <div className="mt-auto flex items-center justify-center space-x-2">
                        <button className="bg-[#F02C56] hover:bg-[#d9254a] text-white text-sm font-medium py-1.5 px-4 rounded-full transition-colors duration-200">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">
                  No users found matching your search criteria.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-md mb-6">
                  Showing {sort === 'recent' ? 'most recent' :
                           sort === 'popular' ? 'most popular' :
                           sort.replace('_', ' ')} users
                </p>
                <Link href="/shop" className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
                  Browse Products Instead
                </Link>
              </div>
            )
          ) : type === 'videos' ? (
            filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="group border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden transform hover:-translate-y-1">
                  <Link href={`/post/${post.id}/${post.user_id}`} className="w-full">
                    <div className="w-full h-48 sm:h-56 overflow-hidden relative">
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-full p-3">
                          <BiPlay className="text-[#F02C56]" size={30} />
                        </div>
                      </div>
                      {/* Video thumbnail - using a video element with poster would be better */}
                      <video
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={useCreateBucketUrl(post.video_url)}
                        preload="metadata"
                      />
                    </div>
                    <div className="flex-grow w-full flex flex-col p-4 min-h-[120px]">
                      <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white">
                        {post.text || 'Video post'}
                      </h2>
                      <div className="flex items-center mt-auto">
                        <div className="flex-shrink-0 mr-3">
                          <img
                            src={useCreateBucketUrl(post.profile.image) || '/images/placeholder-user.jpg'}
                            alt={post.profile.name}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-user.jpg'; }}
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{post.profile.name}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">
                  No videos found matching your search criteria.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-md mb-6">
                  Showing {sort === 'recent' ? 'most recent' :
                           sort === 'popular' ? 'videos from popular creators' :
                           sort.replace('_', ' ')} videos
                </p>
                <Link href="/shop" className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
                  Browse Products Instead
                </Link>
              </div>
            )
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="group border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden transform hover:-translate-y-1">
                <div className="w-full h-48 sm:h-56 overflow-hidden">
                  <img
                    src={product.imageId ? useCreateBucketUrl(product.imageId) : '/images/ii.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
                  />
                </div>
                <div className="flex-grow w-full flex flex-col items-center text-center p-4 min-h-[100px]">
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 truncate w-full px-1 text-gray-900 dark:text-white">{product.name}</h2>
                  <p className="text-md sm:text-lg font-bold text-[#F02C56] dark:text-[#FF4D79] mb-4">₹{product.price.toFixed(2)}</p>
                </div>
                <div className="w-full px-4 pb-4">
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#F02C56] hover:bg-[#d9254a] dark:bg-[#F02C56] dark:hover:bg-[#d9254a] text-white font-bold py-3 px-4 rounded-md text-center w-full transition-colors duration-200"
                  >
                    View Product
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">No products found matching your search criteria.</p>
              <Link href="/shop" className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
