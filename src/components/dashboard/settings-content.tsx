"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sun, Moon, Monitor, Leaf, Mail, User as UserIcon, Shield, TextQuote } from "lucide-react"
import { useFontSize } from "@/components/layout/font-size-provider"
import type { User } from "next-auth"

export function SettingsView({ user }: { user?: User }) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const currentUser = user ?? session?.user
  const { fontSize, setFontSize } = useFontSize()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la configuración de tu cuenta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="size-4" />
            Perfil
          </CardTitle>
          <CardDescription>
            Información básica de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
            <Mail className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{currentUser?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
            <UserIcon className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">{currentUser?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
            <Shield className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Autenticación</p>
              <p className="text-sm font-medium">Google OAuth</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="size-4" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza el tema y tamaño de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mounted ? (
            <>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v!)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue>
                      {theme === "light" ? "Claro" : theme === "general" ? "General" : "Oscuro"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <Sun className="mr-2 size-4 inline" />
                      Claro
                    </SelectItem>
                    <SelectItem value="general">
                      <Leaf className="mr-2 size-4 inline" />
                      General
                    </SelectItem>
                    <SelectItem value="dark">
                      <Moon className="mr-2 size-4 inline" />
                      Oscuro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamaño de texto</Label>
                <Select value={fontSize} onValueChange={(v) => setFontSize(v as "standard" | "large" | "xlarge")}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue>
                      {fontSize === "standard" ? "Estándar" : fontSize === "large" ? "Grande (+25%)" : "Muy grande (+50%)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <TextQuote className="mr-2 size-4 inline" />
                      Estándar
                    </SelectItem>
                    <SelectItem value="large">
                      <TextQuote className="mr-2 size-4 inline" />
                      Grande (+25%)
                    </SelectItem>
                    <SelectItem value="xlarge">
                      <TextQuote className="mr-2 size-4 inline" />
                      Muy grande (+50%)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Tamaño de texto</Label>
                <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Cuenta
          </CardTitle>
          <CardDescription>
            Información de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Tu Natura v1.0.0</p>
          <p>Plataforma profesional para consultores Natura independientes</p>
        </CardContent>
      </Card>
    </div>
  )
}
