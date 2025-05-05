"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { useRouter } from 'next/navigation'
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'
import FollowButton from './FollowButton'
import { RandomUsers } from '@/app/types'

interface UserItemProps {
    user: RandomUsers
}

export default function UserItem({ user }: UserItemProps) {
    const router = useRouter()

    const goToProfile = () => {
        router.push(`/profile/${user.id}`)
    }

    return (
        <div className="flex items-center justify-between w-full bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center cursor-pointer" onClick={goToProfile}>
                <img
                    className="rounded-full object-cover"
                    width="50"
                    height="50"
                    src={useCreateBucketUrl(user?.image)}
                    alt={user?.name}
                    onError={(e) => {
                        // Prevent infinite loops by using a local fallback
                        e.currentTarget.onerror = null; // Remove the error handler
                        e.currentTarget.src = '/images/placeholder-user.png';
                    }}
                />
                <div className="ml-3">
                    <div className="flex items-center">
                        <p className="font-bold text-[16px] truncate text-black dark:text-white">
                            {user?.name}
                        </p>
                        <p className="ml-1 rounded-full bg-[#58D5EC] h-[14px] relative">
                            <AiOutlineCheck className="relative p-[3px]" color="#FFFFFF" size="15"/>
                        </p>
                    </div>
                    <p className="font-light text-[14px] text-gray-600 dark:text-gray-400">
                        @{user?.name.toLowerCase().replace(/\s+/g, '')}
                    </p>
                </div>
            </div>

            <FollowButton targetUserId={user.id} className="py-1.5 px-4 text-[14px]" />
        </div>
    )
}
