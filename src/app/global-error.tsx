"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <AlertCircle className="size-12 text-destructive" />
          <h1 className="text-2xl font-semibold">Erro crítico</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          <Button onClick={unstable_retry} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </body>
    </html>
  )
}
