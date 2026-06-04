"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export type CajaItemInput = {
  productId: string
  cantidad: number
  fechaVencimiento: string | null
}

export async function getCajas() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const cajas = await db.caja.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { fechaVencimiento: "asc" },
      },
    },
    orderBy: { fechaRecibida: "desc" },
  })

  return cajas
}

export async function createCaja(nombre: string, fechaRecibida: string, items: CajaItemInput[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  const userId = session.user.id

  const productIds = items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds }, userId },
    select: { id: true, name: true },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))
  for (const item of items) {
    if (!productMap.has(item.productId)) {
      throw new Error(`Producto no encontrado: ${item.productId}`)
    }
    if (item.cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0")
  }

  const caja = await db.caja.create({
    data: {
      nombre,
      fechaRecibida: new Date(fechaRecibida),
      userId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          cantidad: item.cantidad,
          fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : null,
        })),
      },
    },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
  })

  for (const item of items) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.cantidad } },
    })
  }

  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard")
  return caja
}

export async function deleteCaja(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const caja = await db.caja.findFirst({
    where: { id, userId: session.user.id },
    include: { items: { select: { productId: true, cantidad: true } } },
  })
  if (!caja) throw new Error("Caja no encontrada")

  await db.caja.delete({ where: { id } })

  for (const item of caja.items) {
    await db.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.cantidad } },
    })
  }

  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard")
}
