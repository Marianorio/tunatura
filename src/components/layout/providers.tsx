import { ThemeProvider } from "./theme-provider"
import { QueryProvider } from "./query-provider"
import { AuthProvider } from "./auth-provider"
import { Toaster } from "@/components/ui/sonner"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark", "general"]}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  )
}
