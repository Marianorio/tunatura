"use client"

import { MobileSidebar } from "./mobile-sidebar"
import { UserMenu } from "./user-menu"
import { cn } from "@/lib/utils"
import type { NavItem } from "./sidebar"

export function Navbar({
  items,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  items: NavItem[]
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4",
        "md:px-6"
      )}
    >
      <div className="flex items-center gap-2">
        <MobileSidebar items={items} />
        <button
          onClick={onToggleSidebar}
          className="hidden md:inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d={
                sidebarCollapsed
                  ? "M9 18l6-6-6-6"
                  : "M15 18l-6-6 6-6"
              }
            />
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      <UserMenu />
    </header>
  )
}
