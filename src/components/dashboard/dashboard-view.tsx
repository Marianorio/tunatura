"use client"

import Link from "next/link"
import { ShoppingCart, Package, Users, Plus, AlertTriangle } from "lucide-react"
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

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
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
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido de nuevo, {userName}!
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium",
            "hover:bg-muted hover:text-foreground transition-colors sm:h-8 sm:px-2.5"
          )}
        >
          <Plus className="mr-2 size-4" />
          Nuevo pedido
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              Pedidos pendientes
              {pendingOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingOrders.length}
                </Badge>
              )}
            </h3>
            <Link
              href="/dashboard/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-mono font-medium shrink-0">
                      {order.orderNumber}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {order.customer.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-sm font-medium">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
              <ShoppingCart className="mb-2 size-8 text-muted-foreground/50" />
              No hay pedidos pendientes
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium truncate">
                    {product.name}
                  </span>
                  <span className="text-sm font-mono shrink-0 ml-2">
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
            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
              <Package className="mb-2 size-8 text-muted-foreground/50" />
              Todos los productos tienen stock suficiente
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Pedidos recientes</h3>
          <Link
            href="/dashboard/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    Pedido
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-sm font-mono">{order.orderNumber}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {order.customer.name}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-medium">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant="secondary">
                        {statusLabel[order.status] ?? order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
            <ShoppingCart className="mb-2 size-8 text-muted-foreground/50" />
            No hay pedidos aún
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/orders"
          className={cn(
            "inline-flex h-auto items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-medium",
            "hover:bg-muted hover:text-foreground transition-colors"
          )}
        >
          <ShoppingCart className="size-4" />
          Nuevo pedido
          <span className="ml-auto text-muted-foreground">→</span>
        </Link>
        <Link
          href="/dashboard/products"
          className={cn(
            "inline-flex h-auto items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-medium",
            "hover:bg-muted hover:text-foreground transition-colors"
          )}
        >
          <Package className="size-4" />
          Nuevo producto
          <span className="ml-auto text-muted-foreground">→</span>
        </Link>
        <Link
          href="/dashboard/customers"
          className={cn(
            "inline-flex h-auto items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-medium",
            "hover:bg-muted hover:text-foreground transition-colors"
          )}
        >
          <Users className="size-4" />
          Nuevo cliente
          <span className="ml-auto text-muted-foreground">→</span>
        </Link>
      </div>
    </div>
  )
}
