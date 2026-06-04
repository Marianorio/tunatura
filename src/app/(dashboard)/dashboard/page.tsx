import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { getCuotasPendientes } from "@/server/cuotas"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [pendingOrders, lowStockProducts, recentOrders, expiringProducts, pendingCuotas] = await Promise.all([
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
    db.cajaItem.findMany({
      where: {
        caja: { userId },
        fechaVencimiento: { not: null, lte: thirtyDaysFromNow },
      },
      include: {
        product: { select: { id: true, name: true } },
        caja: { select: { nombre: true } },
      },
      orderBy: { fechaVencimiento: "asc" },
      take: 5,
    }),
    getCuotasPendientes(),
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
      expiringProducts={expiringProducts}
      pendingCuotas={pendingCuotas}
      userName={session?.user?.name ?? "consultor"}
    />
  )
}
