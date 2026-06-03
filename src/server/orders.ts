"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export type OrderFormData = {
  customerId: string
  notes?: string
  cuotas?: number
  items: { productId: string; quantity: number; unitPrice: number }[]
}

function serializeOrder(order: any) {
  if (!order) return null
  return {
    ...order,
    total: Number(order.total),
    items: (order.items ?? []).map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      product: {
        ...item.product,
        price: Number(item.product.price),
        costPrice: item.product.costPrice ? Number(item.product.costPrice) : null,
      },
    })),
  }
}

export async function getOrders() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })

  return orders.map((o) => ({
    ...o,
    total: Number(o.total),
    items: o.items.map((item) => ({
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
}

export async function getOrder(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: { customer: true, items: { include: { product: true } } },
  })

  return serializeOrder(order)
}

export async function createOrder(data: OrderFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const userId = session.user.id

  const productIds = data.items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds }, userId },
    select: { id: true, stock: true, name: true },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of data.items) {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Producto "${item.productId}" no encontrado`)
    if (product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para "${product.name}": disponible ${product.stock}, solicitado ${item.quantity}`
      )
    }
  }

  const subtotals = data.items.map(
    (item) => item.quantity * item.unitPrice
  )
  const total = subtotals.reduce((sum, s) => sum + s, 0)

  const count = await db.order.count({ where: { userId } })
  const orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`

  const order = await db.order.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      userId,
      status: "pending",
      total,
      cuotas: data.cuotas ?? 1,
      notes: data.notes ?? null,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { customer: true, items: { include: { product: true } } },
  })

  await Promise.all(
    data.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    )
  )

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/products")
  return serializeOrder(order)
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!order) throw new Error("Pedido no encontrado")

  const updated = await db.order.update({
    where: { id },
    data: { status },
    include: { customer: true, items: { include: { product: true } } },
  })

  revalidatePath("/dashboard/orders")
  return serializeOrder(updated)
}

export async function deleteOrder(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!order) throw new Error("Pedido no encontrado")

  await db.order.delete({ where: { id } })
  revalidatePath("/dashboard/orders")
}
