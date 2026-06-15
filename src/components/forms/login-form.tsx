"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setErrorMsg(null)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (e) {
      setErrorMsg("Error al iniciar sesión. Revisá la consola (F12).")
      console.error("signIn error:", e)
      setIsGoogleLoading(false)
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCredentialsLoading(true)
    setErrorMsg(null)

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrorMsg("Email o contraseña incorrectos")
        setIsCredentialsLoading(false)
        return
      }

      window.location.href = "/dashboard"
    } catch {
      setErrorMsg("Error de conexión")
      setIsCredentialsLoading(false)
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
              Bienvenido de nuevo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión para continuar
            </p>
          </div>

          <div className="rounded-xl border bg-card p-8 shadow-sm space-y-4">
            {errorMsg && (
              <div className="rounded-lg bg-destructive/10 px-4 py-2 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input id="password" name="password" type="password" placeholder="••••••" required />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isCredentialsLoading}>
                {isCredentialsLoading ? <Loader2 className="size-4 animate-spin" /> : "Iniciar sesión"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continuá con</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border bg-card text-sm font-medium text-foreground transition-all hover:bg-muted hover:shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? "Iniciando sesión..." : "Continuar con Google"}</span>
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No tenés cuenta?{" "}
            <a href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Registrarse
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
