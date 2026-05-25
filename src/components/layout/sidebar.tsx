"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { APP_NAME } from "@/lib/constants"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Settings,
}

export type NavItem = {
  label: string
  href: string
  icon: string
}

export function Sidebar({
  items,
  collapsed = false,
  onToggle,
}: {
  items: NavItem[]
  collapsed?: boolean
  onToggle?: () => void
}) {
  const pathname = usePathname()

  const navItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        Icon: iconMap[item.icon] || LayoutDashboard,
        active: pathname === item.href || pathname.startsWith(item.href + "/"),
      })),
    [items, pathname]
  )

  return (
    <aside
      data-sidebar={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          TN
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">
            {APP_NAME}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map(({ label, href, Icon, active }) => {
            const linkContent = (
              <Link
                href={href}
                className={cn(
                  "inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )

            if (collapsed) {
              return <div key={href} title={label}>{linkContent}</div>
            }

            return <div key={href}>{linkContent}</div>
          })}

        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-2">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-12 w-full"
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expandir"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-sm font-normal"
            onClick={onToggle}
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Recolher</span>
          </Button>
        )}
      </div>
    </aside>
  )
}
