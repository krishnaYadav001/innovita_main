import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import { MenuItemFollowCompTypes } from "@/app/types"
import Link from "next/link"
import { AiOutlineCheck } from "react-icons/ai"
import { useGeneralStore } from "@/app/stores/general"

export default function MenuItemFollow({ user }: MenuItemFollowCompTypes) {
    const { isSidebarExpanded, isMobileView } = useGeneralStore();

    return (
        <>
            <Link
                href={`/profile/${user?.id}`}
                className={`flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md w-full ${isMobileView ? 'py-2 px-3' : 'py-1.5 px-2'}`}
            >
                <img
                    className={`rounded-full ${isSidebarExpanded ? 'mx-0' : 'mx-auto'} object-cover`}
                    width={isMobileView ? "35" : "35"}
                    height={isMobileView ? "35" : "35"}
                    src={useCreateBucketUrl(user?.image)}
                    alt={user?.name || 'User profile'}
                    onError={(e) => {
                        // Prevent infinite loops by using a local fallback
                        e.currentTarget.onerror = null; // Remove the error handler
                        e.currentTarget.src = '/images/placeholder-user.png';
                    }}
                />
                <div className={`${isMobileView ? 'pl-2' : 'pl-2.5'} ${isSidebarExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-center">
                        <p className={`font-bold ${isMobileView ? 'text-[14px]' : 'text-[14px]'} truncate text-black dark:text-white`}>
                            {user?.name}
                        </p>
                        <p className="ml-1 rounded-full bg-[#58D5EC] h-[14px] relative">
                            <AiOutlineCheck className="relative p-[3px]" color="#FFFFFF" size={isMobileView ? "12" : "15"}/>
                        </p>
                    </div>

                    <p className={`font-light ${isMobileView ? 'text-[12px]' : 'text-[12px]'} text-gray-600 dark:text-gray-400`}>
                        {user?.name}
                    </p>
                </div>
            </Link>
        </>
    )
}
