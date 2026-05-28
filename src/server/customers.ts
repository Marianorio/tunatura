"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export type CustomerFormData = {
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

export async function getCustomers() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  return db.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCustomer(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  return db.customer.findFirst({
    where: { id, userId: session.user.id },
  })
}

export async function createCustomer(data: CustomerFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const customer = await db.customer.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard/customers")
  return customer
}

export async function updateCustomer(id: string, data: CustomerFormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const customer = await db.customer.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!customer) throw new Error("Cliente no encontrado")

  const updated = await db.customer.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  })

  revalidatePath("/dashboard/customers")
  return updated
}

export async function deleteCustomer(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const customer = await db.customer.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!customer) throw new Error("Cliente no encontrado")

  await db.customer.delete({ where: { id } })
  revalidatePath("/dashboard/customers")
}
