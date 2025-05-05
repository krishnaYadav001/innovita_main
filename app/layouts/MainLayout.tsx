import { useEffect } from "react";
import React from "react";
import SideNavMain from "@/app/layouts/includes/SideNavMain"; // Use path alias
import TopNav from "./includes/TopNav";
import { useGeneralStore } from "@/app/stores/general";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarExpanded, isMobileView, toggleSidebar } = useGeneralStore()
const { setIsMobileView, setIsSidebarExpanded } = useGeneralStore();

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);
            // Keep sidebar expanded by default on desktop, collapsed on mobile unless explicitly toggled
            // We only set the initial state based on width here, toggling is handled elsewhere
            setIsSidebarExpanded(window.innerWidth >= 768);
        };

        // Run on initial mount
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setIsMobileView, setIsSidebarExpanded]); // Dependencies ensure the functions are stable

    return (
      	<>
			<TopNav/>
			<div className="flex w-full bg-white dark:bg-black relative">
				{/* Overlay for mobile when sidebar is expanded */}
				<div
					className={`fixed top-[60px] left-0 right-0 bottom-0 bg-black/50 z-30 transition-opacity duration-300 ${isMobileView && isSidebarExpanded ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
					onClick={toggleSidebar}
					aria-label="Close sidebar"
				/>


				{/* SideNav is positioned absolutely */}
				<SideNavMain />

				{/* Main content with margin to account for sidebar */}
				<div
					className={`
						${isMobileView
							? 'ml-0 max-w-full' /* No margin adjustment for mobile - sidebar will overlay */
							: isSidebarExpanded
								? 'ml-[220px] xl:ml-[240px] max-w-[calc(100%-220px)] xl:max-w-[calc(100%-240px)]'
								: 'ml-[50px] sm:ml-[60px] md:ml-[70px] max-w-[calc(100%-50px)] sm:max-w-[calc(100%-60px)] md:max-w-[calc(100%-70px)]'}
						w-full transition-all duration-300 px-0 pt-[60px] relative {/* Added relative positioning */}
					`}
				>
					{/* Hamburger menu moved to TopNav */}
					{children}
				</div>
			</div>
      	</>
    )
}
