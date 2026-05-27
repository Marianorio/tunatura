"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import type { ProductFormData } from "@/types"

export async function getProducts() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const products = await db.product.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : null,
  }))
}

export async function getProduct(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const product = await db.product.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!product) return null
  return {
    ...product,
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
  }
}

export async function createProduct(data: ProductFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      costPrice: data.costPrice ? data.costPrice : null,
      category: data.category ?? null,
      stock: data.stock,
      image: data.image ?? null,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard/products")
  return {
    ...product,
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const product = await db.product.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!product) throw new Error("Producto no encontrado")

  const updated = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      costPrice: data.costPrice ? data.costPrice : null,
      category: data.category ?? null,
      stock: data.stock,
      image: data.image ?? null,
    },
  })

  revalidatePath("/dashboard/products")
  return {
    ...updated,
    price: Number(updated.price),
    costPrice: updated.costPrice ? Number(updated.costPrice) : null,
  }
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const product = await db.product.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!product) throw new Error("Producto no encontrado")

  await db.product.delete({ where: { id } })

  revalidatePath("/dashboard/products")
}

export async function toggleProductStatus(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const product = await db.product.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!product) throw new Error("Producto no encontrado")

  const updated = await db.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  })

  revalidatePath("/dashboard/products")
  return {
    ...updated,
    price: Number(updated.price),
    costPrice: updated.costPrice ? Number(updated.costPrice) : null,
  }
}
