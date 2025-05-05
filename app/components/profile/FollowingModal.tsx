"use client"

import { useEffect, useRef } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { FollowWithProfile } from "@/app/types"
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import Link from "next/link"
import FollowButton from "../FollowButton"
import { useUser } from "@/app/context/user"

interface FollowingModalProps {
  isOpen: boolean
  onClose: () => void
  following: FollowWithProfile[]
}

export default function FollowingModal({ isOpen, onClose, following }: FollowingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contextUser = useUser()

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl transform transition-all"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-black dark:text-white">Following</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <AiOutlineClose size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-2">
          {following.length > 0 ? (
            following.map((follow) => (
              <div
                key={follow.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Link
                  href={`/profile/${follow.profile.user_id}`}
                  className="flex items-center flex-1"
                  onClick={onClose}
                >
                  <img
                    src={useCreateBucketUrl(follow.profile.image)}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    alt={follow.profile.name}
                    onError={(e) => {
                      // Prevent infinite loops by using a local fallback
                      e.currentTarget.onerror = null; // Remove the error handler
                      e.currentTarget.src = '/images/placeholder-user.png';
                    }}
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-black dark:text-white">{follow.profile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{follow.profile.name.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </Link>

                {contextUser?.user?.id !== follow.profile.user_id && (
                  <FollowButton targetUserId={follow.profile.user_id} />
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-500 dark:text-gray-400 text-center">Not following anyone yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
