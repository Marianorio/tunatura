"use client"

import { useState, useMemo } from "react"
import { Search, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCustomerDebts } from "@/server/customers"
import { updateOrderStatus } from "@/server/orders"
import { toast } from "sonner"

type UnpaidOrder = {
  id: string
  orderNumber: string
  total: number
  createdAt: Date
}

type CustomerDebt = {
  id: string
  name: string
  phone: string | null
  totalDebt: number
  unpaidOrders: UnpaidOrder[]
}

export function DebtsList({ initial }: { initial: CustomerDebt[] }) {
  const [debts, setDebts] = useState(initial)
  const [search, setSearch] = useState("")

  const filtered = useMemo(
    () =>
      debts.filter((d) => {
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) || (d.phone ?? "").toLowerCase().includes(q)
      }),
    [debts, search]
  )

  async function refresh() {
    const data = await getCustomerDebts()
    setDebts(data)
  }

  async function handleMarkPaid(orderId: string) {
    try {
      await updateOrderStatus(orderId, "confirmed")
      toast.success("Pedido confirmado")
      await refresh()
    } catch (e) {
      toast.error("Error al confirmar el pedido")
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Deudas</h1>
          <p className="text-sm text-muted-foreground">
            Clientes con pedidos pendientes de pago ({filtered.length} de {debts.length})
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar deudor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <DollarSign className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">
            {search ? "Sin resultados" : "No hay deudas pendientes"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Intenta con otro término de búsqueda"
              : "Todos los pedidos están al día"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((customer) => (
            <div key={customer.id} className="rounded-lg border">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{customer.name}</span>
                  {customer.phone && (
                    <span className="ml-2 text-sm text-muted-foreground">{customer.phone}</span>
                  )}
                </div>
                <Badge variant="destructive" className="text-sm shrink-0">
                  ${customer.totalDebt.toFixed(2)}
                </Badge>
              </div>
              <div className="divide-y">
                {customer.unpaidOrders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="text-sm font-mono">{order.orderNumber}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkPaid(order.id)}
                      >
                        Pagado
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
