"use client"

import { BsCart3 } from "react-icons/bs";
import { useCartStore } from "@/app/stores/cart";
import { useGeneralStore } from "@/app/stores/general";

interface CartMenuItemProps {
  colorClass?: string;
  sizeString?: string;
}

export default function CartMenuItem({ colorClass, sizeString = "25" }: CartMenuItemProps) {
  const { totalItems } = useCartStore();
  const { isSidebarExpanded, isMobileView } = useGeneralStore();
  
  // Adjust size for mobile if needed
  const iconSize = isMobileView ? (parseInt(sizeString) - 2).toString() : sizeString;

  return (
    <div className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 ${isMobileView ? 'p-3' : 'p-2.5'} rounded-md relative`}>
      <div className={`flex items-center ${isSidebarExpanded ? 'mx-0' : 'mx-auto'}`}>
        <div className="relative">
          <BsCart3 size={iconSize} className={colorClass || 'text-black dark:text-white'} />
          
          {/* Cart item count badge */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#F02C56] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>

        {/* Text label */}
        <p className={`
          ${isSidebarExpanded ? 'block' : 'hidden'}
          pl-[9px] mt-0.5
          font-semibold
          ${isMobileView ? 'text-[15px]' : 'text-[17px]'}
          ${colorClass || 'text-black dark:text-white'}
        `}>
          Cart
        </p>
      </div>
    </div>
  );
}
