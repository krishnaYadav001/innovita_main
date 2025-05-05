"use client"

import PostUser from "@/app/components/profile/PostUser"
import ProductsTab from "@/app/components/profile/ProductsTab"
import MainLayout from "@/app/layouts/MainLayout"
import { BsPencil } from "react-icons/bs"
import { FiUsers } from "react-icons/fi"
import { useEffect, useState, Suspense } from "react"
import { useUser } from "@/app/context/user"
import ClientOnly from "@/app/components/ClientOnly"
import { ProfilePageTypes, User } from "@/app/types"
import { usePostStore } from "@/app/stores/post"
import { useProfileStore } from "@/app/stores/profile"
import { useGeneralStore } from "@/app/stores/general"
import { useFollowStore } from "@/app/stores/follow"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { useTheme } from "@/app/context/theme"
import FollowButton from "@/app/components/FollowButton"
import FollowersModal from "@/app/components/profile/FollowersModal"
import FollowingModal from "@/app/components/profile/FollowingModal"
import PagePreloader from "@/app/components/loaders/PagePreloader"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Profile({ params }: ProfilePageTypes) {
    const contextUser = useUser()
    const { theme } = useTheme()
    const router = useRouter()
    let { postsByUser, setPostsByUser } = usePostStore()
    let { setCurrentProfile, currentProfile } = useProfileStore()
    let { isEditProfileOpen, setIsEditProfileOpen } = useGeneralStore()
    let { followers, following, followCounts, setFollowers, setFollowing, setFollowCounts } = useFollowStore()

    // State for modals, tabs, and loading
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [activeTab, setActiveTab] = useState('videos') // Default tab is videos
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isLoadingPosts, setIsLoadingPosts] = useState(true)
    const [isLoadingFollows, setIsLoadingFollows] = useState(true)

    // Check authentication status
    useEffect(() => {
        // If we know the user is not authenticated (and not still loading)
        if (!contextUser?.user && !contextUser?.isLoadingUser) {
            console.log('User not authenticated, redirecting to login');
            // Uncomment the next line to enable redirect
            // router.push('/login');
        }
    }, [contextUser?.user, contextUser?.isLoadingUser, router]);

    // Track if initial data has been loaded
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Load profile and posts data in parallel
    useEffect(() => {
        if (params?.id) {
            setIsLoadingProfile(true);
            setIsLoadingPosts(true);

            console.log('Loading profile data for user ID:', params.id);

            // Use Promise.all to load data in parallel
            Promise.all([
                // Load profile data
                setCurrentProfile(params.id), // Remove .catch()

                // Load posts data
                setPostsByUser(params.id) // Remove .catch()
            ])
            .finally(() => {
                setIsLoadingProfile(false);
                setIsLoadingPosts(false);
                setInitialDataLoaded(true);
                console.log('Profile and posts loading complete');
            });
        }
    }, [params?.id])

    // Load follow data separately (only when authenticated)
    useEffect(() => {
        // Only attempt to load follow data if user is authenticated and not loading
        if (params?.id && contextUser?.user && !contextUser.isLoadingUser) {
            setIsLoadingFollows(true);
            console.log('User authenticated, loading follow data');

            // Use Promise.all to load all follow data in parallel
            Promise.all([
                setFollowers(params.id), // Remove .catch()
                setFollowing(params.id), // Remove .catch()
                setFollowCounts(params.id) // Remove .catch()
            ])
            .finally(() => {
                setIsLoadingFollows(false);
                console.log('Follow data loading complete');
            });
        } else {
            // If user is not authenticated, set loading to false
            setIsLoadingFollows(false);
        }
    }, [params?.id, contextUser?.user, contextUser?.isLoadingUser])

    // Show preloader until initial data is loaded
    if (!initialDataLoaded) {
        return (
            <MainLayout>
                <div className="pt-[70px]">
                    <PagePreloader type="profile" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="pt-[70px] w-full px-2 sm:px-4 max-w-[1800px] mx-auto text-black dark:text-white">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row w-full">
                        <ClientOnly>
                            {isLoadingProfile ? (
                                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] min-w-[120px] sm:min-w-[140px] bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:mx-0 border-4 border-white dark:border-gray-800 shadow-md animate-pulse" />
                            ) : currentProfile ? (
                                <div className="relative">
                                    <img
                                        className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] min-w-[120px] sm:min-w-[140px] rounded-full object-cover mx-auto sm:mx-0 border-4 border-white dark:border-gray-800 shadow-md"
                                        src={useCreateBucketUrl(currentProfile?.image)}
                                        alt={currentProfile?.name}
                                        onError={(e) => {
                                            // Prevent infinite loops by using a local fallback
                                            e.currentTarget.onerror = null; // Remove the error handler
                                            e.currentTarget.src = '/images/placeholder-user.png';
                                        }}
                                    />
                                    {/* Verification badge could go here */}
                                </div>
                            ) : (
                                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] min-w-[120px] sm:min-w-[140px] bg-gray-200 dark:bg-gray-700 rounded-full mx-auto sm:mx-0 border-4 border-white dark:border-gray-800 shadow-md" />
                            )}
                        </ClientOnly>

                        <div className="mt-6 sm:mt-0 sm:ml-8 w-full text-center sm:text-left">
                            <ClientOnly>
                                {isLoadingProfile ? (
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="h-[32px] w-[200px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-[18px] w-[150px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                            </div>
                                            <div className="mb-4 sm:mb-0">
                                                <div className="h-[40px] w-[120px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (currentProfile as User)?.name ? (
                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h1 className="text-[32px] font-bold truncate">{currentProfile?.name}</h1>
                                                <p className="text-[18px] text-gray-600 dark:text-gray-300 truncate mb-2">@{currentProfile?.name.toLowerCase().replace(/\s+/g, '')}</p>
                                            </div>

                                            {/* Move follow/edit button here for better layout */}
                                            <div className="mb-4 sm:mb-0">
                                                {contextUser?.user ? (
                                                    contextUser.user.id == params?.id ? (
                                                        <button
                                                            onClick={() => setIsEditProfileOpen(isEditProfileOpen = !isEditProfileOpen)}
                                                            className="flex items-center rounded-md py-2 px-4 text-[15px] font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors"
                                                        >
                                                            <BsPencil className="mt-0.5 mr-2" size="18"/>
                                                            <span>Edit profile</span>
                                                        </button>
                                                    ) : (
                                                        <FollowButton targetUserId={params?.id} className="py-2 px-6 text-[15px]" />
                                                    )
                                                ) : (
                                                    // Show login button for unauthenticated users
                                                    <Link href="/login">
                                                        <button className="flex items-center rounded-md py-2 px-4 text-[15px] font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white transition-colors">
                                                            <span>Login to follow</span>
                                                        </button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {currentProfile?.bio && (
                                            <div className="mt-3 mb-4 max-w-[500px]">
                                                <div className="text-gray-700 dark:text-gray-200 font-normal text-[16px] leading-[22px] whitespace-pre-wrap">
                                                    {currentProfile.bio.split(' ').map((word, index) => {
                                                        if (word.startsWith('#')) {
                                                            return <span key={index} className="text-[#F02C56] dark:text-[#F02C56] font-medium hover:underline cursor-pointer">{word} </span>;
                                                        } else {
                                                            return <span key={index}>{word} </span>;
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Follow stats */}
                                        <div className="flex items-center justify-start mt-4 mb-4 bg-gray-50 dark:bg-gray-800/50 py-2 px-3 rounded-lg mx-auto sm:mx-0 shadow-sm divide-x divide-gray-200 dark:divide-gray-700 w-full max-w-md">
                                            <div className="text-center px-5 flex-1">
                                                {isLoadingPosts ? (
                                                    <>
                                                        <div className="h-[24px] w-[40px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 mx-auto"></div>
                                                        <div className="h-[16px] w-[50px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="block font-bold text-xl leading-tight">{postsByUser.length}</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Only show interactive follow stats if user is logged in */}
                                            {contextUser?.user ? (
                                                isLoadingFollows ? (
                                                    <>
                                                        <div className="text-center px-5 flex-1">
                                                            <div className="h-[24px] w-[40px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 mx-auto"></div>
                                                            <div className="h-[16px] w-[70px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                                        </div>
                                                        <div className="text-center px-5 flex-1">
                                                            <div className="h-[24px] w-[40px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 mx-auto"></div>
                                                            <div className="h-[16px] w-[70px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                                        </div>
                                                    </>
                                                ) : (
                                                <>
                                                    <div
                                                        className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-1 rounded-lg transition-colors flex-1"
                                                        onClick={() => setShowFollowersModal(true)}
                                                    >
                                                        <span className="block font-bold text-xl leading-tight">{followCounts.followers}</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-0.5">
                                                            <FiUsers size="12" />
                                                            Followers
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-1 rounded-lg transition-colors flex-1"
                                                        onClick={() => setShowFollowingModal(true)}
                                                    >
                                                        <span className="block font-bold text-xl leading-tight">{followCounts.following}</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-0.5">
                                                            <FiUsers size="12" />
                                                            Following
                                                        </span>
                                                    </div>
                                                </>
                                                )
                                            ) : (
                                                <>
                                                    {/* Non-interactive follow stats for logged out users */}
                                                    <div className="text-center px-5 flex-1">
                                                        <span className="block font-bold text-xl leading-tight">0</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-0.5">
                                                            <FiUsers size="12" />
                                                            Followers
                                                        </span>
                                                    </div>
                                                    <div className="text-center px-5 flex-1">
                                                        <span className="block font-bold text-xl leading-tight">0</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-0.5">
                                                            <FiUsers size="12" />
                                                            Following
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[60px]" />
                                )}
                            </ClientOnly>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
                    <ul className="flex items-center">
                        <li className="flex-1">
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`w-full text-center py-4 text-[17px] font-semibold relative ${activeTab === 'videos' ? 'border-b-2 border-b-[#F02C56] text-[#F02C56] dark:text-[#F02C56]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'}`}
                            >
                                Videos
                                {activeTab === 'videos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F02C56]"></span>}
                            </button>
                        </li>
                        <li className="flex-1">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`w-full text-center py-4 text-[17px] font-semibold relative ${activeTab === 'products' ? 'border-b-2 border-b-[#F02C56] text-[#F02C56] dark:text-[#F02C56]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'}`}
                            >
                                Products
                                {activeTab === 'products' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F02C56]"></span>}
                            </button>
                        </li>
                        <li className="flex-1">
                            <button
                                onClick={() => setActiveTab('tagged')}
                                className={`w-full text-center py-4 text-[17px] font-semibold relative ${activeTab === 'tagged' ? 'border-b-2 border-b-[#F02C56] text-[#F02C56] dark:text-[#F02C56]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'}`}
                            >
                                Tagged
                                {activeTab === 'tagged' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F02C56]"></span>}
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Content based on active tab */}
                <ClientOnly>
                    {/* Videos Tab */}
                    {activeTab === 'videos' && (
                        postsByUser?.length > 0 ? (
                            <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 animate-fadeIn">
                                {postsByUser?.map((post, index) => (
                                    <div
                                        key={index}
                                        className="transform hover:-translate-y-1 transition-transform duration-200"
                                    >
                                        <PostUser post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="text-6xl mb-4">📹</div>
                                <h3 className="text-2xl font-bold mb-2 text-center">No videos yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                    {contextUser?.user?.id == params?.id ?
                                        "When you upload videos, they'll appear here." :
                                        "This user hasn't uploaded any videos yet."}
                                </p>
                                {contextUser?.user?.id == params?.id && (
                                    <Link href="/upload" className="bg-[#F02C56] hover:bg-[#d9254a] text-white font-medium py-2 px-6 rounded-full transition-colors">
                                        Upload a video
                                    </Link>
                                )}
                            </div>
                        )
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <ProductsTab userId={params?.id} />
                    )}

                    {/* Tagged Tab */}
                    {activeTab === 'tagged' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="text-6xl mb-4">🏷️</div>
                            <h3 className="text-2xl font-bold mb-2 text-center">Tagged Content</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                Content where {contextUser?.user?.id == params?.id ? "you are" : "this user is"} tagged will appear here.
                            </p>
                        </div>
                    )}
                </ClientOnly>

                <div className="pb-20" />
            </div>

            {/* Only render modals if user is authenticated */}
            {contextUser?.user && (
                <>
                    {/* Followers Modal */}
                    <FollowersModal
                        isOpen={showFollowersModal}
                        onClose={() => setShowFollowersModal(false)}
                        followers={followers}
                    />

                    {/* Following Modal */}
                    <FollowingModal
                        isOpen={showFollowingModal}
                        onClose={() => setShowFollowingModal(false)}
                        following={following}
                    />
                </>
            )}
        </MainLayout>
    )
}
