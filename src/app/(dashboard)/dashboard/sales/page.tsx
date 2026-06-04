import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { SalesDashboard } from "@/components/dashboard/sales-dashboard"

async function getRiskyCustomers(userId: string) {
  const customers = await db.customer.findMany({
    where: { userId },
    include: {
      orders: {
        where: { status: "pending" },
        select: {
          id: true,
          total: true,
          cuotas: true,
          createdAt: true,
          cuotaRecords: {
            select: { id: true, monto: true, vencimiento: true, pagada: true },
          },
        },
      },
    },
  })

  const now = new Date()
  const scored = customers
    .map((c) => {
      const totalDebt = Number(c.orders.reduce((s, o) => s + Number(o.total), 0))
      if (totalDebt === 0) return null

      let overdueCuotas = 0
      let pendingCuotas = 0
      let oldestCreatedAt = now

      for (const order of c.orders) {
        if (order.createdAt < oldestCreatedAt) oldestCreatedAt = order.createdAt
        for (const cr of order.cuotaRecords) {
          if (!cr.pagada) {
            if (new Date(cr.vencimiento) < now) {
              overdueCuotas++
            } else {
              pendingCuotas++
            }
          }
        }
      }

      const monthsSinceOldest =
        (now.getTime() - oldestCreatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)

      // Risk score: overdue cuotas heavily weighted
      const riskScore =
        overdueCuotas * 10 +
        pendingCuotas * 3 +
        totalDebt / 1000 +
        monthsSinceOldest * 5

      return {
        id: c.id,
        name: c.name,
        totalDebt,
        overdueCuotas,
        pendingCuotas,
        oldestOrderAgeDays: Math.round(
          (now.getTime() - oldestCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
        riskScore,
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)

  return scored
}

export default async function SalesPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [orders, productCount, customerCount, riskyCustomers] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where: { userId } }),
    db.customer.count({ where: { userId } }),
    userId ? getRiskyCustomers(userId) : Promise.resolve([]),
  ])

  const serialized = orders.map((order) => ({
    ...order,
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      product: {
        ...item.product,
        price: Number(item.product.price),
        costPrice: item.product.costPrice ? Number(item.product.costPrice) : null,
      },
    })),
  }))

  return (
    <SalesDashboard
      orders={serialized}
      productCount={productCount}
      customerCount={customerCount}
      riskyCustomers={riskyCustomers}
    />
  )
}
