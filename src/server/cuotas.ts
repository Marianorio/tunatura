"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function payCuota(cuotaId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const cuota = await db.cuota.findFirst({
    where: { id: cuotaId, order: { userId: session.user.id } },
  })
  if (!cuota) throw new Error("Cuota no encontrada")
  if (cuota.pagada) throw new Error("Esta cuota ya está pagada")

  await db.cuota.update({
    where: { id: cuotaId },
    data: { pagada: true, fechaPago: new Date() },
  })

  revalidatePath("/dashboard/debts")
  revalidatePath("/dashboard")
}

export async function getCuotasPendientes() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const cuotas = await db.cuota.findMany({
    where: {
      pagada: false,
      order: { userId: session.user.id, status: "pending" },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          cuotas: true,
          customer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { vencimiento: "asc" },
    take: 20,
  })

  return cuotas.map((c) => ({
    id: c.id,
    numero: c.numero,
    totalCuotas: c.order.cuotas,
    monto: Number(c.monto),
    vencimiento: c.vencimiento,
    orderNumber: c.order.orderNumber,
    customerName: c.order.customer.name,
    customerId: c.order.customer.id,
  }))
}
