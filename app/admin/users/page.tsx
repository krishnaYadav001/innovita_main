"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useUser } from '../../context/user';
import { useRouter } from 'next/navigation';
import { BiTrash, BiUser, BiArrowBack, BiLoaderCircle } from 'react-icons/bi';
import { UserListSkeleton } from '../../components/loaders/SkeletonLoader';
import { FiUsers } from 'react-icons/fi';
import useIsAdmin from '../../hooks/useIsAdmin';
import useDeleteUser from '../../hooks/useDeleteUser';
import useGetAllUsers from '@/app/hooks/useGetAllUsers'; // Use path alias
import useCreateBucketUrl from '../../hooks/useCreateBucketUrl';
import Link from 'next/link';
import { useGeneralStore } from '../../stores/general';

export default function AdminUsersPage() {
    const contextUser = useUser();
    const router = useRouter();
    const isAdmin = useIsAdmin();

    // Get all users
    const { users, isLoading: isLoadingUsers, error: usersError, refetchUsers }: {
        users: any[];
        isLoading: boolean;
        error: string | null;
        refetchUsers: () => Promise<void>
    } = useGetAllUsers();

    // Delete user hook
    const { deleteUser, isLoading: isDeletingUser, error: deleteError } = useDeleteUser();

    // State to track if the initial auth check is done
    const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'forbidden'>('loading');

    // Get loading state from context
    const isLoadingUser = contextUser?.isLoadingUser ?? true; // Default to true if context is not ready

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any | null>(null);

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

    // Handle user deletion
    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setShowConfirmModal(true);
    };

    // Get the general store for sidebar data refresh
    const { setRandomUsers, setPopularUsers, setFollowingUsers } = useGeneralStore();

    const confirmDelete = async () => {
        if (!userToDelete) return;

        const success = await deleteUser(userToDelete.user_id);
        if (success) {
            setShowConfirmModal(false);
            setUserToDelete(null);

            // Refresh the users list in the admin page
            refetchUsers();

            // Manually refresh sidebar data to ensure it's updated immediately
            try {
                setRandomUsers();
                setPopularUsers();

                // If there's a logged-in user, refresh their following list
                if (contextUser?.user?.id) {
                    setFollowingUsers(contextUser.user.id);
                }
            } catch (refreshError) {
                console.error('Error refreshing sidebar data:', refreshError);
            }
        } else {
            alert(`Failed to delete user: ${deleteError || 'Unknown error'}`);
        }
    };

    const cancelDelete = () => {
        setShowConfirmModal(false);
        setUserToDelete(null);
    };

    // Loading State
    if (isLoadingUser || authStatus === 'loading') {
        return (
            <MainLayout>
                <div className="pt-[80px] w-full flex flex-col justify-center items-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                            <div className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-black dark:text-white mt-4">Checking permissions...</p>
                </div>
            </MainLayout>
        );
    }

    // Forbidden State
    if (authStatus === 'forbidden') {
        return (
            <MainLayout>
                <div className="pt-[80px] w-full flex flex-col justify-center items-center">
                    <p className="text-red-500 text-xl">You do not have permission to access this page.</p>
                    <Link href="/" className="mt-4 text-blue-500 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </MainLayout>
        );
    }

    // Admin Content
    return (
        <MainLayout>
            {/* Main content container */}
            <div className="pt-[80px] w-full px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Header Row: Title and Back Button */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-center sm:text-left text-black dark:text-white">
                        Admin - User Management
                    </h1>
                    <Link
                        href="/admin"
                        className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded whitespace-nowrap w-full sm:w-auto justify-center transition-all duration-200"
                    >
                        <BiArrowBack size={20} className="mr-1"/> Back to Admin
                    </Link>
                </div>

                {/* User List */}
                {isLoadingUsers ? (
                    <div className="w-full">
                        <UserListSkeleton count={10} />
                    </div>
                ) : usersError ? (
                    <p className="text-red-600 text-center py-4">Error loading users: {usersError}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">User</th>
                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">ID</th>
                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Bio</th>
                                    <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">Created</th>
                                    <th className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
                                                    {user.image ? (
                                                        <img
                                                            src={useCreateBucketUrl(user.image)}
                                                            alt={user.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                // Prevent infinite loops by using a local fallback
                                                                e.currentTarget.onerror = null; // Remove the error handler
                                                                e.currentTarget.src = '/images/placeholder-user.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <BiUser size={20} className="text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                                                    <Link
                                                        href={`/profile/${user.user_id}`}
                                                        className="text-sm text-blue-500 hover:underline"
                                                    >
                                                        View Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {user.user_id}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm max-w-[200px] truncate">
                                            {user.bio || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={isDeletingUser || user.user_id === contextUser?.user?.id}
                                                className={`p-2 rounded-full ${
                                                    user.user_id === contextUser?.user?.id
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                                                }`}
                                                title={user.user_id === contextUser?.user?.id ? "Cannot delete your own account" : "Delete user"}
                                            >
                                                <BiTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <FiUsers size={40} className="mb-2" />
                                                <p>No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Confirm User Deletion</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the user <span className="font-bold">{userToDelete.name}</span>?
                            This will permanently delete the user account and all associated content including:
                        </p>
                        <ul className="list-disc pl-5 mb-6 text-gray-600 dark:text-gray-300">
                            <li>All posts and videos</li>
                            <li>All comments</li>
                            <li>All likes</li>
                            <li>Profile information</li>
                            <li>Follow relationships</li>
                        </ul>
                        <p className="text-red-600 font-bold mb-6">This action cannot be undone!</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeletingUser}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center"
                            >
                                {isDeletingUser ? (
                                    <>
                                        <BiLoaderCircle className="animate-spin mr-2" size={18} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <BiTrash className="mr-2" size={18} />
                                        Delete User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
