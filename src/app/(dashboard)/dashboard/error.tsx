"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-xl font-semibold">Algo salió mal</h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "Ocurrió un error inesperado."}
      </p>
      <Button onClick={unstable_retry} variant="outline">
        Intentar de nuevo
      </Button>
    </div>
  )
}
