"use client"

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
  return (
    <Sheet>
      <SheetTrigger
        className="md:hidden inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar items={items} />
      </SheetContent>
    </Sheet>
  )
}
