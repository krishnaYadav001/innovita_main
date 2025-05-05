import NavLink from "@/app/components/NavLink"
import { usePathname } from "next/navigation"
import MenuItem from "./MenuItem"
import MenuItemFollow from "./MenuItemFollow"
import CartMenuItem from "./CartMenuItem"
import { useEffect } from "react"
// No longer need to import useTheme or useUser since we're using Tailwind's dark mode utilities
import ClientOnly from "@/app/components/ClientOnly"
import { useGeneralStore } from "@/app/stores/general"

export default function SideNavMain() {

    let { setRandomUsers, setPopularUsers, popularUsers, allPopularUsers, showAllUsers, setShowAllUsers, isSidebarExpanded, isMobileView } = useGeneralStore()
    // No longer need theme variable since we're using Tailwind's dark mode utilities
    const pathname = usePathname()

    useEffect(() => {
        // Fetch random and popular users
        setRandomUsers();
        setPopularUsers();
    }, [])

    // Define CSS classes using Tailwind's dark mode utilities instead of dynamic values
    const activeColorClass = 'text-[#F02C56]'; // Keep active color consistent for both light and dark modes
    const inactiveColorClass = 'text-black dark:text-white'; // Use CSS classes for theme-based colors

    return (
        <>
            <div
                id="SideNavMain"
                className={`
                    fixed ${isMobileView ? 'z-40' : 'z-20'} bg-white dark:bg-gray-900 h-full
                    ${isMobileView && isSidebarExpanded ? 'shadow-lg' : 'shadow-none'}
                    ${!isMobileView || isSidebarExpanded ? 'border-r border-r-gray-300 dark:border-r-gray-700' : 'border-r-0'}
                    overflow-auto left-0 top-[60px] bottom-0 custom-scrollbar
                    ${isSidebarExpanded
                        ? isMobileView
                            ? 'w-[80%] max-w-[300px] translate-x-0'
                            : 'w-[220px] xl:w-[240px]'
                        : isMobileView
                            ? 'w-[80%] max-w-[300px] -translate-x-full'
                            : 'w-[50px] sm:w-[60px] md:w-[70px]'}
                    transition-all duration-300 ease-in-out
                `}
            >

                {/* We've moved the hamburger menu back to the TopNav */}

                <div className={`
                    w-full
                    ${isSidebarExpanded
                        ? 'lg:w-full'
                        : 'max-w-[55px] sm:max-w-[65px] md:max-w-none'}
                    mx-auto
                    ${isMobileView ? 'px-1' : 'px-1 sm:px-2'}
                    ${isSidebarExpanded && !isMobileView ? 'lg:px-0' : ''}
                    text-black dark:text-white
                `}>
                    <NavLink href="/">
                        <MenuItem
                            iconString="For You"
                            colorClass={pathname == '/' ? activeColorClass : inactiveColorClass}
                            sizeString="25"
                        />
                    </NavLink>
                    <NavLink href="/connection">
                        <MenuItem
                            iconString="Connection"
                            colorClass={pathname == '/connection' ? activeColorClass : inactiveColorClass}
                            sizeString="25"
                        />
                    </NavLink>
                    <NavLink href="/live">
                        <MenuItem
                            iconString="LIVE"
                            colorClass={pathname == '/live' ? activeColorClass : inactiveColorClass}
                            sizeString="25"
                        />
                    </NavLink>
                    <NavLink href="/shop">
                        <MenuItem
                            iconString="Shop"
                            colorClass={pathname == '/shop' ? activeColorClass : inactiveColorClass}
                            sizeString="25"
                        />
                    </NavLink>
                    <NavLink href="/cart">
                        <CartMenuItem
                            colorClass={pathname == '/cart' ? activeColorClass : inactiveColorClass}
                            sizeString="25"
                        />
                    </NavLink>

                    <div className="border-b border-gray-300 dark:border-gray-700 lg:ml-2 mt-2" />
                    <h3 className={`${isSidebarExpanded ? 'block' : 'hidden'} text-xs text-gray-600 dark:text-gray-400 font-semibold pt-4 pb-2 px-2`}>Suggested accounts</h3>

                    <div className={`${isSidebarExpanded ? 'hidden' : 'block'} pt-3`} />
                    <ClientOnly>
                        <div className="cursor-pointer">
                            {/* Display popular users sorted by likes */}
                            {showAllUsers
                                ? allPopularUsers?.map((user, index) => (
                                    <MenuItemFollow key={index} user={user} />
                                ))
                                : popularUsers?.map((user, index) => (
                                    <MenuItemFollow key={index} user={user} />
                                ))
                            }
                        </div>
                    </ClientOnly>

                    <button
                        onClick={() => setShowAllUsers(!showAllUsers)}
                        className={`${isSidebarExpanded ? 'block' : 'hidden'} text-[#F02C56] hover:underline pt-1.5 pl-2 text-[13px]`}
                    >
                        {showAllUsers ? 'Show less' : 'See all'}
                    </button>

                    {/* Following accounts section removed */}
                    <div className={`${isSidebarExpanded ? 'block' : 'hidden'} border-b border-gray-300 dark:border-gray-700 lg:ml-2 mt-2`} />

                    <div className={`${isSidebarExpanded ? 'block' : 'hidden'} text-[11px] text-gray-600 dark:text-gray-400`}>
                        <p className="pt-4 px-2">focusing on everything you need to know about sustainability, sustainable lifestyle, and green technology.</p>
                        <p className="pt-4 px-2">We offer the best educational content and practical ideas on becoming more eco-friendly </p>
                        <p className="pt-4 px-2">Help Safety Terms Privacy Creator Portal Community Guidelines</p>
                        <p className="pt-4 px-2">© 2024 Innovita</p>
                    </div>

                    <div className="pb-14"></div>
                </div>

            </div>
        </>
    )
}
