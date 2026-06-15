"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "@/lib/constants"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Settings,
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around py-1.5 px-2">
        {NAV_LINKS.map(({ label, href, icon }) => {
          const Icon = iconMap[icon]
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] transition-colors",
                active
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
