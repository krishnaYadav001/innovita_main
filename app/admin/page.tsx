"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useUser } from '../context/user';
import { useRouter } from 'next/navigation'; // For redirection
import { Product } from '../types';
import useGetAllProducts from '../hooks/useGetAllProducts';
import useDeleteProduct from '../hooks/useDeleteProduct';
import useCreateBucketUrl from '../hooks/useCreateBucketUrl';
import EditProductModal from '../components/modals/EditProductModal'; // Reuse the edit modal
import AddProductAdminModal from '../components/modals/AddProductAdminModal'; // Import the new add modal
import { BiEdit, BiTrash, BiPlus, BiUserX, BiLoaderCircle } from 'react-icons/bi';
import { ProductGridSkeleton } from '../components/loaders/SkeletonLoader';
import { FiUsers } from 'react-icons/fi';
import Link from 'next/link';
import useIsAdmin from '../hooks/useIsAdmin';

export default function AdminPage() {
    const contextUser = useUser();
    const router = useRouter();

    // State for managing modals
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showAddModal, setShowAddModal] = useState(false); // State for Add modal visibility

    // Fetch all products
    const { products, isLoading: isLoadingProducts, error: productsError, refetchProducts } = useGetAllProducts();

    // Delete product hook
    const { deleteProduct, isLoading: isDeleting, error: deleteError } = useDeleteProduct();

    // State to track if the initial auth check is done AND if user is admin
    const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'forbidden'>('loading');

    // Get loading state from context
    const isLoadingUser = contextUser?.isLoadingUser ?? true; // Default to true if context is not ready

    // Use the admin hook
    const isAdmin = useIsAdmin();

    useEffect(() => {
        // Check if user context is *finished* loading
        if (!isLoadingUser) {
            if (isAdmin) {
                setAuthStatus('admin');
            } else {
                setAuthStatus('forbidden');
                router.push('/');
            }
        }
    }, [isLoadingUser, isAdmin, router]);

    // Handle product deletion
    const handleDelete = async (productToDelete: Product) => {
        if (!window.confirm(`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`)) {
            return;
        }
        const success = await deleteProduct(productToDelete.id, productToDelete.imageId);
        if (success) {
            refetchProducts();
        } else {
            alert(`Failed to delete product: ${deleteError || 'Unknown error'}`);
        }
    };

    // Loading State
    if (isLoadingUser) {
        return (
            <MainLayout>
                {/* Added dark mode text */}
                <div className="pt-[80px] w-full flex justify-center items-center">
                    <BiLoaderCircle className="animate-spin text-blue-500" size={40} />
                    <p className="ml-3 text-black dark:text-white">Checking permissions...</p>
                </div>
            </MainLayout>
        );
    }

    // Forbidden State
     if (authStatus === 'forbidden') {
         return (
             <MainLayout>
                 <div className="pt-[80px] w-full flex justify-center items-center">
                     <p className="ml-3 text-red-600">Access Denied.</p>
                 </div>
             </MainLayout>
         );
     }

    // Admin Content
    if (authStatus === 'admin') {
        return (
        <MainLayout>
            {/* Main content container - Added dark mode background */}
            <div className="pt-[80px] w-full px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
                 {/* Header Row: Title and Button */}
                 <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                     {/* Added dark mode text */}
                     <h1 className="text-2xl font-bold text-center sm:text-left text-black dark:text-white">Admin Dashboard</h1>
                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                         <Link
                             href="/admin/users"
                             className="flex items-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap w-full justify-center transition-all duration-200"
                         >
                             <FiUsers size={20} className="mr-1"/> Manage Users
                         </Link>
                         <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center bg-[#F02C56] hover:bg-[#d9254a] dark:bg-[#d9254a] dark:hover:bg-[#b01e3c] text-white font-bold py-2 px-4 rounded whitespace-nowrap w-full justify-center transition-all duration-200"
                         >
                             <BiPlus size={20} className="mr-1"/> Add New Product
                         </button>
                     </div>
                 </div>

                 {/* Section Title */}
                 <div className="mb-4">
                     <h2 className="text-xl font-semibold text-black dark:text-white">Product Management</h2>
                 </div>
                 {/* Product List container starts here */}

                {isLoadingProducts ? (
                    <div className="w-full">
                        <ProductGridSkeleton count={8} />
                    </div>
                ) : productsError ? (
                    <p className="text-red-600 text-center py-4">Error loading products: {productsError}</p>
                ) : (
                    /* Responsive Card Grid Layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            /* Added dark mode background, border */
                            <div key={product.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col shadow-md hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-900 overflow-hidden hover:border-[#F02C56] dark:hover:border-[#d9254a]">
                                <img
                                    src={useCreateBucketUrl(product.imageId)}
                                    alt={product.name}
                                    className="w-full h-40 object-cover mb-3 rounded-md"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/ii.png'; }}
                                />
                                <div className="flex-grow w-full flex flex-col text-left mb-3 min-h-[60px]">
                                    {/* Added dark mode text */}
                                    <h3 className="text-base font-semibold mb-1 truncate w-full text-gray-900 dark:text-white">{product.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">${product.price.toFixed(2)}</p>
                                </div>
                                {/* Admin Actions - Added dark mode border */}
                                <div className="mt-auto flex justify-end space-x-2 border-t border-gray-200 dark:border-t-gray-700 pt-3">
                                     <button
                                        onClick={() => setEditingProduct(product)}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-white bg-[#4285F4] hover:bg-[#3367d6] dark:bg-[#3367d6] dark:hover:bg-[#2a56b2] rounded-md focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        disabled={isDeleting}
                                        aria-label={`Edit ${product.name}`}
                                    >
                                        <BiEdit size={16} className="mr-1"/> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product)}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-white bg-[#F02C56] hover:bg-[#d9254a] dark:bg-[#d9254a] dark:hover:bg-[#b01e3c] rounded-md focus:ring-2 focus:outline-none focus:ring-red-300 dark:focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        disabled={isDeleting}
                                        aria-label={`Delete ${product.name}`}
                                    >
                                        <BiTrash size={16} className="mr-1"/> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* No products message - Added dark mode text */}
                {!isLoadingProducts && products.length === 0 && <p className="text-center p-4 text-gray-500 dark:text-gray-400 mt-6">No products found.</p>}
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onProductUpdated={() => {
                        setEditingProduct(null);
                        refetchProducts();
                    }}
                />
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <AddProductAdminModal
                    onClose={() => setShowAddModal(false)}
                    onProductAdded={() => {
                        setShowAddModal(false);
                        refetchProducts();
                    }}
                />
            )}
        </MainLayout>
        );
    }

    // Fallback return
    return null;
}