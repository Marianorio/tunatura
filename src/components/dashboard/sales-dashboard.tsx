"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { TrendingUpIcon, ShoppingCartIcon, DollarSignIcon, UsersIcon } from "lucide-react"

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

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
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

  const ordersByStatus = [
    { name: "Pendientes", value: orders.filter((o) => o.status === "pending").length },
    { name: "Confirmados", value: orders.filter((o) => o.status === "confirmed").length },
    { name: "Entregados", value: orders.filter((o) => o.status === "delivered").length },
    { name: "Cancelados", value: orders.filter((o) => o.status === "cancelled").length },
  ].filter((d) => d.value > 0)

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

  const recentOrders = orders.slice(0, 5)

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Analiza tus ventas y facturación
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Ingresos totales"
          value={formatCurrency(totalRevenue)}
          description="Todos los pedidos"
          icon={<DollarSignIcon />}
        />
        <DashboardCard
          title="Pedidos totales"
          value={totalOrders}
          description={`${pendingOrders} pendientes`}
          icon={<ShoppingCartIcon />}
        />
        <DashboardCard
          title="Ticket promedio"
          value={formatCurrency(avgOrderValue)}
          description="Por pedido"
          icon={<TrendingUpIcon />}
        />
        <DashboardCard
          title="Productos"
          value={productCount}
          description={`${customerCount} clientes`}
          icon={<UsersIcon />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Ventas mensuales</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Productos más vendidos</h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine
                  >
                    {topProducts.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin datos de ventas
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Tendencia de pedidos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pedidos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Pedidos recientes</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-mono font-medium">
                      {order.orderNumber}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {order.customer.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statusLabel[order.status] ?? order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sin pedidos recientes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
