"use client"

import Link from "next/link"
import { ShoppingCart, Package, Users, Plus, AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRight, LayoutDashboard, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SerializedOrder = {
  id: string
  orderNumber: string
  customerId: string
  userId: string
  status: string
  total: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  customer: { id: string; name: string; email: string | null; phone: string | null; address: string | null; notes: string | null; userId: string; createdAt: Date; updatedAt: Date }
}

type SerializedProduct = {
  id: string
  name: string
  price: number
  costPrice: number | null
  stock: number
  isActive: boolean
  category: string | null
  description: string | null
  image: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  delivered: { label: "Entregado", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

export function DashboardView({
  pendingOrders,
  lowStockProducts,
  recentOrders,
  userName,
}: {
  pendingOrders: SerializedOrder[]
  lowStockProducts: SerializedProduct[]
  recentOrders: SerializedOrder[]
  userName: string
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de nuevo, {userName}!
          </p>
        </div>
        <Link
          href="/dashboard/orders?openForm=true"
          className="inline-flex h-9 items-center justify-center rounded-lg border bg-card px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <Plus className="mr-2 size-4" />
          Nuevo pedido
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-amber-500" />
              Pedidos pendientes
              {pendingOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingOrders.length}
                </Badge>
              )}
            </h3>
            <Link
              href="/dashboard/orders"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todos →
            </Link>
          </div>
          {pendingOrders.length > 0 ? (
            <div className="space-y-2">
              {pendingOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/dashboard/orders"
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3.5 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-mono font-medium shrink-0">
                      {order.orderNumber}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {order.customer.name}
                    </span>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <span className="text-sm font-semibold">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
              <CheckCircle2 className="mb-2 size-8 text-emerald-400" />
              No hay pedidos pendientes
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-amber-500" />
              Stock bajo
              {lowStockProducts.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {lowStockProducts.length}
                </Badge>
              )}
            </h3>
            <Link
              href="/dashboard/products"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver todos →
            </Link>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/dashboard/products"
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3.5 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <span className="truncate text-sm font-medium">
                    {product.name}
                  </span>
                  <span className="ml-2 shrink-0">
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Agotado</Badge>
                    ) : (
                      <Badge variant="secondary">{product.stock} uds.</Badge>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
              <Package className="mb-2 size-8 text-emerald-400" />
              Todos los productos tienen stock suficiente
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Pedidos recientes</h3>
          <Link
            href="/dashboard/orders"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver todos →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[450px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const status = statusConfig[order.status] ?? statusConfig.pending
                  return (
                    <tr key={order.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-mono font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{order.customer.name}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">${Number(order.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            <ShoppingCart className="mb-2 size-8 text-muted-foreground/50" />
            No hay pedidos aún
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/orders"
          className="group flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-sm font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="size-4 text-primary" />
          </div>
          <span>Nuevo pedido</span>
          <ArrowRight className="ml-auto size-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/products"
          className="group flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-sm font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-4 text-primary" />
          </div>
          <span>Nuevo producto</span>
          <ArrowRight className="ml-auto size-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/customers"
          className="group flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-sm font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span>Nuevo cliente</span>
          <ArrowRight className="ml-auto size-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
        </Link>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-around py-1.5 px-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-[10px] text-primary font-medium">
            <LayoutDashboard className="size-5" />
            Inicio
          </Link>
          <Link href="/dashboard/products" className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <Package className="size-5" />
            Productos
          </Link>
          <Link href="/dashboard/orders" className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="size-5" />
            Pedidos
          </Link>
          <Link href="/dashboard/debts" className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <DollarSign className="size-5" />
            Deudas
          </Link>
          <Link href="/dashboard/sales" className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <TrendingUp className="size-5" />
            Ventas
          </Link>
        </div>
      </div>
    </div>
  )
}
