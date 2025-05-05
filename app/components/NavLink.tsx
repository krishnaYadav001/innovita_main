"use client"

import Link from "next/link"
import { useGeneralStore } from "@/app/stores/general"
import { ReactNode } from "react"

interface NavLinkProps {
  href: string
  children: ReactNode
}

export default function NavLink({ href, children }: NavLinkProps) {
  const { isMobileView, setIsSidebarExpanded } = useGeneralStore()

  const handleClick = () => {
    // Only close the sidebar in mobile view
    if (isMobileView) {
      // Use a small timeout to ensure navigation happens first
      setTimeout(() => {
        setIsSidebarExpanded(false)
      }, 150)
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}
