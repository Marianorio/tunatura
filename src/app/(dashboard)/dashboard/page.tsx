import { auth } from "@/server/auth"
import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { PackageIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

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
          title="Produtos"
          value="0"
          description="Total de productos registrados"
          icon={<PackageIcon />}
        />
        <DashboardCard
          title="Clientes"
          value="0"
          description="Total de clientes activos"
          icon={<UsersIcon />}
        />
        <DashboardCard
          title="Pedidos"
          value="0"
          description="Pedidos este mes"
          icon={<ShoppingCartIcon />}
        />
        <DashboardCard
          title="Vendas"
          value="R$ 0"
          description="Facturación total"
          icon={<TrendingUpIcon />}
        />
      </div>
    </div>
  )
}
