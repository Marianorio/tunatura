"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type SerializedProduct = {
  id: string; name: string; price: number; costPrice: number | null; stock: number
  isActive: boolean; category: string | null; description: string | null; image: string | null
  userId: string; createdAt: Date; updatedAt: Date
}

type SerializedOrderItem = {
  id: string; orderId: string; productId: string; quantity: number
  unitPrice: number; subtotal: number; product: SerializedProduct
}

type SerializedOrder = {
  id: string; orderNumber: string; customerId: string; userId: string
  status: string; total: number; notes: string | null; createdAt: Date; updatedAt: Date
  customer: { id: string; name: string; email: string | null; phone: string | null; address: string | null; notes: string | null; userId: string; createdAt: Date; updatedAt: Date }
  items: SerializedOrderItem[]
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string; bg: string }> = {
  pending: { label: "Pendiente", variant: "secondary", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
  confirmed: { label: "Confirmado", variant: "default", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  delivered: { label: "Entregado", variant: "outline", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
  cancelled: { label: "Cancelado", variant: "destructive", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
}

function KpiCard({ title, value, description, icon, accent }: { title: string; value: string; description: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={cn("absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full opacity-10", accent)} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accent)}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      {description && (
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export function SalesDashboard({
  orders,
  productCount,
  customerCount,
}: {
  orders: SerializedOrder[]
  productCount: number
  customerCount: number
}) {
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (11 - i))
    const monthStr = month.toLocaleString("es", { month: "short" })
    const monthOrders = orders.filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
    })
    return {
      name: monthStr,
      ventas: monthOrders.reduce((sum, o) => sum + Number(o.total), 0),
      pedidos: monthOrders.length,
    }
  })

  const topProducts = Array.from(
    orders
      .flatMap((o) => o.items)
      .reduce((acc, item) => {
        const name = item.product.name
        acc.set(name, (acc.get(name) ?? 0) + item.quantity)
        return acc
      }, new Map<string, number>())
      .entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  const topCustomers = Array.from(
    orders
      .reduce((acc, order) => {
        const name = order.customer.name
        const existing = acc.get(name)
        if (existing) {
          existing.orders++
          existing.total += Number(order.total)
        } else {
          acc.set(name, { name, orders: 1, total: Number(order.total) })
        }
        return acc
      }, new Map<string, { name: string; orders: number; total: number }>())
      .entries()
  )
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([, data]) => data)

  const recentOrders = orders.slice(0, 5)

  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length
  const totalCost = orders
    .flatMap((o) => o.items)
    .reduce((sum, item) => sum + Number(item.product.costPrice ?? 0) * item.quantity, 0)
  const estimatedProfit = totalRevenue - totalCost

  const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.ventas ?? 0
  const prevMonthRevenue = monthlyData[monthlyData.length - 2]?.ventas ?? 0
  const revenueTrend = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1) : null

  const statusSummary = [
    { label: "Pendientes", count: pendingOrders, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Confirmados", count: confirmedOrders, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Entregados", count: deliveredOrders, icon: Package, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Cancelados", count: cancelledOrders, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Analiza tus ventas y facturación
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos totales"
          value={formatCurrency(totalRevenue)}
          description={revenueTrend !== null ? `${revenueTrend}% vs el mes anterior` : "Todos los pedidos"}
          icon={<DollarSign className="size-5" />}
          accent="bg-emerald-600"
        />
        <KpiCard
          title="Pedidos totales"
          value={String(totalOrders)}
          description={`${pendingOrders} pendientes · ${deliveredOrders} entregados`}
          icon={<ShoppingCart className="size-5" />}
          accent="bg-blue-600"
        />
        <KpiCard
          title="Ticket promedio"
          value={formatCurrency(avgOrderValue)}
          description="Por pedido"
          icon={<TrendingUp className="size-5" />}
          accent="bg-violet-600"
        />
        <KpiCard
          title="Ganancia estimada"
          value={formatCurrency(estimatedProfit)}
          description={`${productCount} productos · ${customerCount} clientes`}
          icon={<Award className="size-5" />}
          accent="bg-amber-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusSummary.map((s) => (
          <div key={s.label} className={cn("flex items-center gap-3 rounded-lg border bg-card px-4 py-3", s.bg)}>
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", s.bg)}>
              <s.icon className={cn("size-4", s.color)} />
            </div>
            <div>
              <p className="text-lg font-semibold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Ventas mensuales</h3>
              <p className="text-xs text-muted-foreground">Evolución de ingresos por mes</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: "var(--color-primary)" }} />
                Ingresos
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: "var(--color-chart-2)" }} />
                Pedidos
              </span>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                  tickFormatter={(v) => `$${v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [
                    name === "ventas" ? formatCurrency(Number(value)) : value,
                    name === "ventas" ? "Ingresos" : "Pedidos",
                  ]}
                />
                <Bar yAxisId="left" dataKey="ventas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar yAxisId="right" dataKey="pedidos" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Productos más vendidos</h3>
              <p className="text-xs text-muted-foreground">Top 5 por cantidad</p>
            </div>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, i) => {
                const maxQty = topProducts[0]?.value ?? 1
                const barWidth = (product.value / maxQty) * 100
                return (
                  <div key={product.name} className="group">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                          i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                          i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                        <span className="text-sm truncate">{product.name}</span>
                      </div>
                      <span className="ml-2 text-sm font-semibold shrink-0">{product.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Sin datos de ventas
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Clientes destacados</h3>
              <p className="text-xs text-muted-foreground">Top 5 por facturación</p>
            </div>
          </div>
          {topCustomers.length > 0 ? (
            <div className="space-y-2">
              {topCustomers.map((customer, i) => (
                <div
                  key={customer.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.orders} pedido{customer.orders !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-semibold shrink-0">{formatCurrency(customer.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Sin clientes aún
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Pedidos recientes</h3>
              <p className="text-xs text-muted-foreground">Últimos 5 pedidos</p>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const status = statusConfig[order.status] ?? statusConfig.pending
                return (
                  <div
                    key={order.id}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <ShoppingCart className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Sin pedidos recientes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
