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

export default function FollowingPage() {
    const router = useRouter()
    const contextUser = useUser()
    const [isLoading, setIsLoading] = useState(true)
    const { following, setFollowing } = useFollowStore()
    const { setIsLoginOpen } = useGeneralStore()

    useEffect(() => {
        // Check if user is logged in
        if (!contextUser?.user && !contextUser?.isLoadingUser) {
            // If not logged in and not loading, redirect to login
            setIsLoginOpen(true)
            router.push('/')
            return
        }

        const loadFollowingData = async () => {
            if (contextUser?.user?.id && !contextUser.isLoadingUser) {
                try {
                    setIsLoading(true)
                    await setFollowing(contextUser.user.id)
                } catch (error) {
                    console.error('Error loading following data:', error)
                } finally {
                    setIsLoading(false)
                }
            } else if (!contextUser?.isLoadingUser) {
                setIsLoading(false)
            }
        }

        loadFollowingData()
    }, [contextUser?.user, contextUser?.isLoadingUser])

    return (
        <MainLayout>
            <div className="pt-[80px] w-full max-w-[1200px] mx-auto text-black dark:text-white">
                <div className="px-4">
                    <h1 className="text-2xl font-bold mb-6">Accounts you're following</h1>

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
                </div>
            </div>
        </MainLayout>
    )
}
