"use client"

import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  Settings,
  User,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from "next-themes"

export function UserMenu() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  if (!session?.user) return null

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-full focus:outline-none"
        aria-label="User menu"
      >
        <Avatar className="size-8">
          <AvatarImage
            src={session.user.image ?? undefined}
            alt={session.user.name ?? ""}
          />
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 size-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.location.href = "/dashboard/settings"}
          >
            <Settings className="mr-2 size-4" />
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 size-4" />
            Claro
            {theme === "light" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 size-4" />
            Oscuro
            {theme === "dark" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 size-4" />
            Sistema
            {theme === "system" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
