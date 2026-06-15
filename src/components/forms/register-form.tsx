"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const name = form.get("name") as string
    const email = form.get("email") as string
    const password = form.get("password") as string
    const confirm = form.get("confirmPassword") as string

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        setIsLoading(false)
        return
      }

      await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
    } catch {
      setError("Error de conexión")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Registrate para empezar</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-8 shadow-sm space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Tu nombre" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetí la contraseña" minLength={6} required />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Crear cuenta"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Ya tenés cuenta?{" "}
              <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Iniciar sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
