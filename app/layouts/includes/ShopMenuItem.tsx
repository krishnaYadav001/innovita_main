"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/context/user';
import useGetLatestPostWithProductByUser from '@/app/hooks/useGetLatestPostWithProductByUser';
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl';
import MenuItem from './MenuItem'; // Use the original MenuItem for the default case
import { BiLoaderCircle } from 'react-icons/bi';

const ShopMenuItem: React.FC = () => {
    const contextUser = useUser();
    const pathname = usePathname();
    const { linkedProduct, isLoading, error } = useGetLatestPostWithProductByUser(contextUser?.user?.id);

    const isActive = pathname === '/shop';
    // Use CSS classes instead of direct color values to avoid hydration issues
    const iconColorClass = isActive ? 'text-[#F02C56]' : 'text-black dark:text-white';
    const textClass = isActive ? 'text-[#F02C56]' : 'text-black';

    // Loading State
    if (isLoading) {
        return (
            <div className="w-full flex items-center hover:bg-gray-100 p-2.5 rounded-md">
                 <BiLoaderCircle className="animate-spin mx-auto text-black dark:text-white" size={25} />
                 {/* Optionally show placeholder text when expanded */}
                 <div className={`pl-3.5 ${textClass} lg:block hidden`}>
                     <span className={`font-semibold text-[16px] truncate`}>Loading...</span>
                 </div>
            </div>
        );
    }

    // Logged in user and has a linked product for their latest post
    if (contextUser?.user && linkedProduct) {
        return (
            <Link href="/shop" className="flex items-center hover:bg-gray-100 p-2.5 rounded-md">
                {/* Product Image */}
                <img
                    src={useCreateBucketUrl(linkedProduct.imageId)}
                    alt={linkedProduct.name}
                    className="min-w-[25px] max-w-[25px] h-[25px] rounded-sm object-cover" // Style similar to icon size
                />
                {/* Product Name (visible when expanded) */}
                <div className={`pl-3.5 ${textClass} lg:block hidden`}>
                    <span className={`font-semibold text-[16px] truncate`}>
                        {linkedProduct.name}
                    </span>
                </div>
            </Link>
        );
    }

    // Default: Not logged in, error fetching, or no product linked to latest post
    return (
        <Link href="/shop">
            <MenuItem
                iconString="Shop" // Default icon
                colorClass={iconColorClass}
                sizeString="25"
            />
        </Link>
    );
};

export default ShopMenuItem;