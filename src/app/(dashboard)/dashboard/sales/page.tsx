import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { SalesDashboard } from "@/components/dashboard/sales-dashboard"

export default async function SalesPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [orders, productCount, customerCount] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.product.count({ where: { userId } }),
    db.customer.count({ where: { userId } }),
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
    />
  )
}
