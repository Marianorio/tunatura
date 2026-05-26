import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { PackageIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [productCount, customerCount, orderCount, salesTotal] = await Promise.all([
    db.product.count({ where: { userId } }),
    db.customer.count({ where: { userId } }),
    db.order.count({ where: { userId } }),
    db.order.aggregate({ where: { userId }, _sum: { total: true } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bienvenido de nuevo, {session?.user?.name ?? "consultor"}!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Productos"
          value={productCount}
          description="Total de productos registrados"
          icon={<PackageIcon />}
        />
        <DashboardCard
          title="Clientes"
          value={customerCount}
          description="Total de clientes activos"
          icon={<UsersIcon />}
        />
        <DashboardCard
          title="Pedidos"
          value={orderCount}
          description="Pedidos este mes"
          icon={<ShoppingCartIcon />}
        />
        <DashboardCard
          title="Ventas"
          value={salesTotal._sum.total ? `$${Number(salesTotal._sum.total).toFixed(2)}` : "$0"}
          description="Facturación total"
          icon={<TrendingUpIcon />}
        />
      </div>
    </div>
  )
}
