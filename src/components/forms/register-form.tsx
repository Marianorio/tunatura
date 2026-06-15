"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function RegisterForm() {
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
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="mb-6">
            <Image
              src="/tunaturalogo2.png"
              alt={APP_NAME}
              width={240}
              height={240}
              className="size-60 brightness-0 invert"
            />
          </div>
          <h1 className="mb-3 text-center text-3xl font-bold tracking-tight">
            {APP_NAME}
          </h1>
          <p className="max-w-md text-center text-lg text-white/70">
            {APP_DESCRIPTION}
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">Productos</p>
              <p className="text-sm text-white/60">Catálogo inteligente</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Clientes</p>
              <p className="text-sm text-white/60">Gestión simple</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Ventas</p>
              <p className="text-sm text-white/60">Reportes claros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-4 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/tunaturalogo2.png"
                alt={APP_NAME}
                width={96}
                height={96}
                className="size-24 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
          </div>

          <div className="mb-8 text-center hidden lg:block">
            <h2 className="text-2xl font-semibold text-foreground">
              Crear cuenta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Registrate para empezar
            </p>
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
