"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Sidebar, type NavItem } from "./sidebar"

export function MobileSidebar({
  items,
}: {
  items: NavItem[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full p-0 border-r-0 sm:max-w-sm sm:border-r">
        <Sidebar items={items} />
      </SheetContent>
    </Sheet>
  )
}
