import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BiUser, BiMenu, BiSearch, BiArrowBack } from "react-icons/bi"; // Added BiArrowBack
import { AiOutlinePlus } from "react-icons/ai";
import { BsThreeDotsVertical, BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/user";
import { useTheme } from "@/app/context/theme";
import { useGeneralStore } from "@/app/stores/general";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl"
import SearchBar from "@/app/components/search/SearchBar";

export default function TopNav() {
    const userContext = useUser()
    const router = useRouter()
    const pathname = usePathname()

    let [showMenu, setShowMenu] = useState<boolean>(false);
    const { theme, toggleTheme } = useTheme();
    let { setIsLoginOpen, setIsEditProfileOpen, toggleSidebar, isSidebarExpanded, isMobileView } = useGeneralStore();
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false); // State for mobile search view

    useEffect(() => { setIsEditProfileOpen(false) }, [])

    const goTo = () => {
        if (!userContext?.user) return setIsLoginOpen(true)
        router.push('/upload')
    }

    return (
        <>
            {/* Added dark mode background and border */}
            <div id="TopNav" className="fixed bg-white dark:bg-gray-900 dark:border-b dark:border-b-gray-700 z-50 flex items-center w-full border-b h-[60px]">
                {/* Conditional Rendering for Mobile Search View */}
                {isMobileView && isMobileSearchOpen ? (
                    <div className="flex items-center justify-start w-full px-2">
                        <button
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-1"
                            aria-label="Close search"
                        >
                            <BiArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="flex-grow">
                            {/* Pass simple={true} to SearchBar to hide filter/search icons within it */}
                            <SearchBar className="w-full" simple={true} />
                        </div>
                    </div>
                ) : (
                    /* Normal TopNav Layout */
                    <div className={`flex items-center justify-between gap-3 w-full ${isMobileView ? 'px-2' : 'px-4'} mx-auto ${pathname === '/' ? 'max-w-[1150px]' : ''} relative`}>
                        {/* Hamburger menu in left corner for desktop */}
                        {!isMobileView && (
                            <button
                                onClick={toggleSidebar}
                                className="absolute left-2 flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                            >
                                <BiMenu
                                    size={32}
                                    className="text-gray-700 dark:text-gray-300"
                                />
                            </button>
                        )}

                        <div className="flex items-center">
                            {/* For mobile view, keep hamburger next to logo */}
                            {isMobileView && (
                                <button
                                    onClick={toggleSidebar}
                                    className="flex items-center justify-center p-2 mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                                >
                                    <BiMenu
                                        size={32}
                                        className="text-gray-700 dark:text-gray-300"
                                    />
                                </button>
                            )}

                            <Link href="/" className={`${!isMobileView ? 'ml-14' : ''}`}>
                                <img
                                    className={`${isMobileView ? 'min-w-[90px] w-[90px]' : 'min-w-[115px] w-[115px]'}`}
                                    src="/images/iii.png"
                                    alt="Innovita Logo"
                                />
                            </Link>
                        </div>

                        {/* Search Bar Component - Hidden on mobile */}
                        <div className="hidden md:block flex-grow max-w-[430px] w-full mx-2">
                            <SearchBar />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mobile Search Button - only visible on mobile */}
                            {isMobileView && (
                                <button
                                    onClick={() => setIsMobileSearchOpen(true)} // Open mobile search view
                                    className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-1"
                                    aria-label="Search"
                                >
                                    <BiSearch size={22} className="text-gray-700 dark:text-gray-300" />
                                </button>
                            )}

                            {/* Hamburger menu moved to left side */}

                            {/* Upload button */}
                            <button
                                onClick={() => goTo()}
                                className={`
                                    flex items-center justify-center border dark:border-gray-600
                                    ${isMobileView ? 'rounded-full p-2' : 'rounded-md py-[6px] pl-1.5'}
                                    hover:bg-gray-100 dark:hover:bg-gray-800
                                    ${isMobileView ? 'ml-1' : ''}
                                `}
                            >
                                <AiOutlinePlus
                                    className="text-black dark:text-white"
                                    size={isMobileView ? "22" : "22"}
                                />
                                {!isMobileView && (
                                    <span className="px-2 font-medium text-[15px] text-black dark:text-white">
                                        Upload
                                    </span>
                                )}
                            </button>

                            {!userContext?.user?.id ? (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="flex items-center bg-[#F02C56] text-white border rounded-md px-3 py-[6px]"
                                    >
                                        <span className="whitespace-nowrap mx-4 font-medium text-[15px]">Log in</span>
                                    </button>
                                    <BsThreeDotsVertical className="text-black dark:text-white" size="25"/>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    {/* Theme Toggle Button */}
                                    <button
                                        onClick={toggleTheme}
                                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                                    >
                                        {theme === 'light' ? (
                                            <BsMoonStarsFill size={20} className="text-gray-700"/>
                                        ) : (
                                            <BsSunFill size={22} className="text-yellow-400"/>
                                        )}
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="mt-1 border border-gray-200 dark:border-gray-700 rounded-full"
                                        >
                                            <img className="rounded-full w-[35px] h-[35px]" src={useCreateBucketUrl(userContext?.user?.image || '')} />
                                        </button>

                                        {showMenu ? (
                                            <div className="absolute bg-white dark:bg-gray-800 rounded-lg py-1.5 w-[200px] shadow-xl border dark:border-gray-700 top-[40px] right-0">
                                                <button
                                                    onClick={() => {
                                                        router.push(`/profile/${userContext?.user?.id}`)
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center w-full justify-start py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                >
                                                    <BiUser size="20" className="text-black dark:text-white"/>
                                                    <span className="pl-2 font-semibold text-sm text-black dark:text-white">Profile</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await userContext?.logout()
                                                        setShowMenu(false)
                                                    }}
                                                    className="flex items-center justify-start w-full py-3 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 border-t dark:border-t-gray-700 cursor-pointer"
                                                >
                                                    <FiLogOut size={20} className="text-black dark:text-white"/>
                                                    <span className="pl-2 font-semibold text-sm text-black dark:text-white">Log out</span>
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
        </>
    )
}