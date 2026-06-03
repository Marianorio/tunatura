"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, DollarSign, Phone, CalendarDays, ChevronRight, AlertTriangle, Clock, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCustomerDebts } from "@/server/customers"
import { updateOrderStatus } from "@/server/orders"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type UnpaidOrder = {
  id: string
  orderNumber: string
  total: number
  cuotas: number
  createdAt: Date
}

type CustomerDebt = {
  id: string
  name: string
  phone: string | null
  totalDebt: number
  unpaidOrders: UnpaidOrder[]
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

const urgencyConfig = [
  { threshold: 30, label: "Crítico", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20", badge: "destructive" as const },
  { threshold: 15, label: "Precaución", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20", badge: "secondary" as const },
  { threshold: 0, label: "Reciente", color: "text-muted-foreground", bg: "bg-muted/30", badge: "outline" as const },
]

function getUrgency(days: number) {
  return urgencyConfig.find((u) => days >= u.threshold) ?? urgencyConfig[urgencyConfig.length - 1]
}

export function DebtsList({ initial }: { initial: CustomerDebt[] }) {
  const [debts, setDebts] = useState(initial)
  const [search, setSearch] = useState("")

  const sortedByDebt = useMemo(
    () => [...debts].sort((a, b) => b.totalDebt - a.totalDebt),
    [debts]
  )

  const filtered = useMemo(
    () =>
      sortedByDebt.filter((d) => {
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) || (d.phone ?? "").toLowerCase().includes(q)
      }),
    [sortedByDebt, search]
  )

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  useEffect(() => { setPage(1) }, [search])

  const totalOutstanding = debts.reduce((s, d) => s + d.totalDebt, 0)
  const criticalCount = debts.filter((d) => daysSince(d.unpaidOrders[0]?.createdAt ?? new Date()) >= 30).length

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deudas</h1>
          <p className="text-sm text-muted-foreground">
            Clientes con pedidos pendientes de pago
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total adeudado</p>
          <p className="text-xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Deudores</p>
          <p className="text-xl font-bold">{debts.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Casos críticos (+30 días)</p>
          <p className="text-xl font-bold text-amber-600">{criticalCount}</p>
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16">
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
          {paginated.map((customer) => {
            const oldestDays = daysSince(customer.unpaidOrders[customer.unpaidOrders.length - 1]?.createdAt ?? new Date())
            const urgency = getUrgency(oldestDays)
            return (
              <div key={customer.id} className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", urgency.bg)}>
                      <DollarSign className={cn("size-5", urgency.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{customer.name}</p>
                      {customer.phone && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="size-3" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">${customer.totalDebt.toFixed(2)}</p>
                      <p className={cn("flex items-center gap-1 text-xs", urgency.color)}>
                        <Clock className="size-3" />
                        {oldestDays}d sin pagar
                      </p>
                    </div>
                    <Badge variant={urgency.badge}>{urgency.label}</Badge>
                  </div>
                </div>
                <div className="divide-y">
                  {customer.unpaidOrders.map((order) => {
                    const days = daysSince(order.createdAt)
                    const urgency = getUrgency(days)
                    return (
                      <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-muted/20">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
                          <span className="text-sm font-mono font-medium">{order.orderNumber}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <CalendarDays className="size-3" />
                            {new Date(order.createdAt).toLocaleDateString("es-AR")}
                          </span>
                          {order.cuotas > 1 && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0">
                              {order.cuotas} cuotas · ${(order.total / order.cuotas).toFixed(2)}/mes
                            </span>
                          )}
                          <span className={cn("text-xs font-medium shrink-0", urgency.color)}>
                            ({days}d)
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            onClick={() => handleMarkPaid(order.id)}
                          >
                            <DollarSign className="mr-1 size-3" />
                            Pagado
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="size-8 text-xs" onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
