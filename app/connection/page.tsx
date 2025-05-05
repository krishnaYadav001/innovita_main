"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import { useUser } from '@/app/context/user'
import { useFollowStore } from '@/app/stores/follow'
import { useGeneralStore } from '@/app/stores/general'
import { Following } from '@/app/hooks/useGetFollowing'
import UserItem from '@/app/components/UserItem'
import ClientOnly from '@/app/components/ClientOnly'
import { BiLoaderCircle } from 'react-icons/bi'
import { Tab } from '@headlessui/react'

export default function ConnectionPage() {
    const router = useRouter()
    const contextUser = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const { following, followers, setFollowing, setFollowers } = useFollowStore()
    const { setIsLoginOpen } = useGeneralStore()

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!contextUser?.user && !contextUser?.isLoadingUser) {
            setIsLoginOpen(true)
            router.push('/')
            return
        }

        const fetchData = async () => {
            if (contextUser?.user?.id) {
                setIsLoading(true)
                await Promise.all([
                    setFollowing(contextUser.user.id),
                    setFollowers(contextUser.user.id)
                ])
                setIsLoading(false)
            }
        }

        if (contextUser?.user?.id && !contextUser.isLoadingUser) {
            fetchData()
        }
    }, [contextUser?.user, contextUser?.isLoadingUser, router, setIsLoginOpen, setFollowing, setFollowers])

    return (
        <MainLayout>
            <div className="pt-[80px] w-full max-w-[1200px] mx-auto text-black dark:text-white">
                <div className="px-4">
                    <h1 className="text-2xl font-bold mb-6">Connections</h1>
                    
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                                ${selected 
                                    ? 'bg-white dark:bg-gray-700 shadow text-[#F02C56]' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-[#F02C56]'
                                }`
                            }>
                                Following
                            </Tab>
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                                ${selected 
                                    ? 'bg-white dark:bg-gray-700 shadow text-[#F02C56]' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-[#F02C56]'
                                }`
                            }>
                                Followers
                            </Tab>
                        </Tab.List>
                        
                        <Tab.Panels>
                            {/* Following Panel */}
                            <Tab.Panel>
                                <ClientOnly>
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-[200px]">
                                            <BiLoaderCircle className="animate-spin" size={40} color="#F02C56" />
                                        </div>
                                    ) : following && following.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {following.map((user: Following) => (
                                                <UserItem 
                                                    key={user.id} 
                                                    user={{
                                                        id: user.profile.user_id,
                                                        name: user.profile.name,
                                                        image: user.profile.image
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-lg mb-4">You aren't following anyone yet</p>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                                When you follow someone, they'll appear here.
                                            </p>
                                        </div>
                                    )}
                                </ClientOnly>
                            </Tab.Panel>
                            
                            {/* Followers Panel */}
                            <Tab.Panel>
                                <ClientOnly>
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-[200px]">
                                            <BiLoaderCircle className="animate-spin" size={40} color="#F02C56" />
                                        </div>
                                    ) : followers && followers.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {followers.map((user: Following) => (
                                                <UserItem 
                                                    key={user.id} 
                                                    user={{
                                                        id: user.profile.user_id,
                                                        name: user.profile.name,
                                                        image: user.profile.image
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-lg mb-4">You don't have any followers yet</p>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                                When someone follows you, they'll appear here.
                                            </p>
                                        </div>
                                    )}
                                </ClientOnly>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </MainLayout>
    )
}
