"use client"

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
import { Sun, Moon, Monitor, Mail, User as UserIcon, Shield } from "lucide-react"
import type { User } from "next-auth"

export function SettingsView({ user }: { user?: User }) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const currentUser = user ?? session?.user

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
            Personaliza el tema de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v!)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <Sun className="mr-2 size-4 inline" />
                  Claro
                </SelectItem>
                <SelectItem value="dark">
                  <Moon className="mr-2 size-4 inline" />
                  Oscuro
                </SelectItem>
                <SelectItem value="system">
                  <Monitor className="mr-2 size-4 inline" />
                  Sistema
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
