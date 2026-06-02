import { getOrders } from "@/server/orders"
import { db } from "@/server/db"
import { auth } from "@/server/auth"
import { OrderList } from "@/components/dashboard/order-list"

export default async function OrdersPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [orders, customers, products] = await Promise.all([
    getOrders(),
    db.customer.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, price: true, barcode: true, stock: true },
      orderBy: { name: "asc" },
    }).then((ps) => ps.map((p) => ({ ...p, price: Number(p.price) }))),
  ])

  return <OrderList orders={orders} customers={customers} products={products} />
}
