"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-xl font-semibold">Erro de autenticação</h2>
      <p className="text-sm text-muted-foreground">
        {error.message ?? "Não foi possível autenticar."}
      </p>
      <Button onClick={unstable_retry} variant="outline">
        Tentar novamente
      </Button>
    </div>
  )
}
