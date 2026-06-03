import { ThemeProvider } from "./theme-provider"
import { QueryProvider } from "./query-provider"
import { AuthProvider } from "./auth-provider"
import { FontSizeProvider } from "./font-size-provider"
import { Toaster } from "@/components/ui/sonner"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <FontSizeProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="general"
          themes={["light", "dark", "general"]}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
        </FontSizeProvider>
      </QueryProvider>
    </AuthProvider>
  )
}
