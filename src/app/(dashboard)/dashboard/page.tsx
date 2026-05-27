import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [pendingOrders, lowStockProducts, recentOrders] = await Promise.all([
    db.order.findMany({
      where: { userId, status: "pending" },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.product.findMany({
      where: { userId, isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    db.order.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <DashboardView
      pendingOrders={pendingOrders.map((o) => ({ ...o, total: Number(o.total) }))}
      lowStockProducts={lowStockProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        costPrice: p.costPrice ? Number(p.costPrice) : null,
      }))}
      recentOrders={recentOrders.map((o) => ({ ...o, total: Number(o.total) }))}
      userName={session?.user?.name ?? "consultor"}
    />
  )
}
