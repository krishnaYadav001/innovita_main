"use client"

import { AiOutlineHome } from "react-icons/ai"
import { RiGroupLine } from "react-icons/ri";
import { BsCameraVideo } from "react-icons/bs";
import { FaShoppingBag } from "react-icons/fa"; // Changed from BsCart3 to FaShoppingBag
import { MenuItemTypes } from "@/app/types";
import { useGeneralStore } from "@/app/stores/general";

export default function MenuItem({ iconString, colorString, colorClass, sizeString }: MenuItemTypes) {
    const { isSidebarExpanded, isMobileView } = useGeneralStore();

    const icons = () => {
        // Adjust size for mobile if needed
        const iconSize = isMobileView ? (parseInt(sizeString) - 2).toString() : sizeString;

        // Use CSS classes if provided, otherwise fall back to color prop for backward compatibility
        if (iconString == 'For You') return <AiOutlineHome size={iconSize} className={colorClass} color={!colorClass ? colorString : undefined} />
        if (iconString == 'Following' || iconString == 'Connection') return <RiGroupLine size={iconSize} className={colorClass} color={!colorClass ? colorString : undefined} />
        if (iconString == 'LIVE') return <BsCameraVideo size={iconSize} className={colorClass} color={!colorClass ? colorString : undefined} />;
        if (iconString == 'Shop') return <FaShoppingBag size={iconSize} className={colorClass} color={!colorClass ? colorString : undefined} />; // Changed to shopping bag icon
    };

    return (
        <>
            {/* Added dark mode hover background */}
            <div className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 ${isMobileView ? 'p-3' : 'p-2.5'} rounded-md`}>
                <div className={`flex items-center ${isSidebarExpanded ? 'mx-0' : 'mx-auto'}`}>

                    {icons()}

                    {/* Text with proper dark mode styling */}
                    <p className={`
                        ${isSidebarExpanded ? 'block' : 'hidden'}
                        pl-[9px] mt-0.5
                        font-semibold
                        ${isMobileView ? 'text-[15px]' : 'text-[17px]'}
                        ${colorClass || ''}
                    `} style={!colorClass && colorString ? { color: colorString } : undefined}>
                        {iconString}
                    </p>
                </div>
            </div>
        </>
    )
}
