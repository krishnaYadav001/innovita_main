"use client"; // Need this for useState

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useGeneralStore } from './stores/general';
import UserProvider from './context/user';
import { ThemeProvider } from './context/theme'; // Import ThemeProvider
import AllOverlays from "@/app/components/AllOverlays";
import ChatbotButton from '@/app/components/chatbot/ChatbotButton'; // Import ChatbotButton
import ChatWindow from '@/app/components/chatbot/ChatWindow'; // Import ChatWindow
import usePrefetch from './hooks/usePrefetch'; // Import prefetch hook
import ClientOnly from './components/ClientOnly'; // Import ClientOnly
import './globals.css'
import type { Metadata } from 'next'

// Note: Metadata export might need adjustment if RootLayout becomes a full client component
// export const metadata: Metadata = {
//   title: 'Innovita',
//   description: 'tik tok clone',
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false); // State for chat window
  const { setIsMobileView, setIsSidebarExpanded } = useGeneralStore();

  // Use the prefetch hook
  usePrefetch();

  // Detect mobile view and set state accordingly
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // Consider mobile if width is less than 768px
      setIsMobileView(isMobile);

      // Auto-collapse sidebar on mobile, expand on desktop
      if (isMobile) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileView, setIsSidebarExpanded]);

  return (
    <html lang="en" className="h-full"> {/* ADDED h-full */}
      {/* Wrap UserProvider with ThemeProvider */}
      <ThemeProvider>
        <UserProvider>
          {/* Added base dark mode background and text color */}
          <body suppressHydrationWarning={true} className="bg-white dark:bg-black dark:text-white h-full"> {/* ADDED h-full */}
            <AllOverlays />
            {children}

            {/* Chatbot Components - wrapped in ClientOnly to prevent hydration errors */}
            <ClientOnly>
              <ChatbotButton onClick={() => setIsChatOpen(true)} />
              <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </ClientOnly>
          </body>
        </UserProvider>
      </ThemeProvider>
    </html>
  )
}
