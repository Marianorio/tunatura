"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Trash2, Plus, ShoppingCart, Search, Clock, CheckCircle2, Package, XCircle, User, Hash, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import type { Customer } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderForm, type OrderFormValues } from "@/components/forms/order-form"
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from "@/server/orders"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SerializedProduct = {
  id: string
  name: string
  price: number
  costPrice: number | null
  stock: number
  isActive: boolean
  category: string | null
  description: string | null
  image: string | null
  barcode: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

type SerializedOrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  product: SerializedProduct
}

type SerializedOrder = {
  id: string
  orderNumber: string
  customerId: string
  userId: string
  status: string
  total: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  customer: Customer
  items: SerializedOrderItem[]
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" | "destructive"; color: string; bg: string }> = {
  pending: { label: "Pendiente", icon: Clock, variant: "secondary", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
  confirmed: { label: "Confirmado", icon: CheckCircle2, variant: "default", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  delivered: { label: "Entregado", icon: Package, variant: "outline", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
  cancelled: { label: "Cancelado", icon: XCircle, variant: "destructive", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
}

export function OrderList({
  orders: initial,
  customers,
  products,
}: {
  orders: SerializedOrder[]
  customers: Pick<Customer, "id" | "name">[]
  products: { id: string; name: string; price: number; barcode: string | null; stock: number }[]
}) {
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState(initial)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (searchParams.get("openForm") === "true") {
      setIsDialogOpen(true)
    }
  }, [searchParams])

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length
  const deliveredCount = orders.filter((o) => o.status === "delivered").length
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const q = search.toLowerCase()
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.items.some((i) => i.product.name.toLowerCase().includes(q))
        )
      }),
    [orders, search]
  )

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  useEffect(() => { setPage(1) }, [search])

  async function refresh() {
    const data = await getOrders()
    setOrders(data)
  }

  async function handleCreate(values: OrderFormValues) {
    setIsSubmitting(true)
    try {
      await createOrder(values)
      toast.success("Pedido creado correctamente")
      setIsDialogOpen(false)
      await refresh()
    } catch (e) {
      toast.error("Error al crear el pedido")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateOrderStatus(id, status)
      toast.success("Estado actualizado")
      await refresh()
    } catch (e) {
      toast.error("Error al actualizar el estado")
      console.error(e)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) return
    try {
      await deleteOrder(id)
      toast.success("Pedido eliminado correctamente")
      await refresh()
    } catch (e) {
      toast.error("Error al eliminar el pedido")
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Seguimiento de todos los pedidos realizados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Nuevo pedido
          </Button>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo pedido</DialogTitle>
              <DialogDescription>
                Crea un nuevo pedido seleccionando cliente y productos
              </DialogDescription>
            </DialogHeader>
            <OrderForm
              customers={customers}
              products={products}
              onSubmit={handleCreate}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Pendientes", count: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "Confirmados", count: confirmedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Entregados", count: deliveredCount, icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Cancelados", count: cancelledCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
        ].map((s) => (
          <div key={s.label} className={cn("flex items-center gap-3 rounded-lg border bg-card px-4 py-3", s.bg)}>
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", s.bg)}>
              <s.icon className={cn("size-4", s.color)} />
            </div>
            <div>
              <p className="text-lg font-semibold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, cliente o producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16">
          <ShoppingCart className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">
            {search ? "Sin resultados" : "No hay pedidos"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Intenta con otro término de búsqueda"
              : "Crea tu primer pedido para empezar"}
          </p>
          {!search && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Nuevo pedido
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pedido</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Productos</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => {
                const status = statusConfig[order.status] ?? statusConfig.pending
                const StatusIcon = status.icon
                return (
                  <tr key={order.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Hash className="size-3.5 text-muted-foreground" />
                        <span className="text-sm font-mono font-medium">
                          {order.orderNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{order.customer.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {order.items.map((i) => i.product.name).join(", ")}
                      </div>
                    </td>
                    <td className="hidden max-w-[220px] truncate px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                      {order.items.map((i) => i.product.name).join(", ")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <DollarSign className="size-3.5 text-muted-foreground" />
                        {Number(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Select
                        value={order.status ?? "pending"}
                        onValueChange={(v) => handleStatusChange(order.id, v ?? "pending")}
                      >
                        <SelectTrigger className={cn("h-7 w-fit gap-1.5 border-0 px-2.5 text-xs font-medium", status.bg)}>
                          <StatusIcon className={cn("size-3", status.color)} />
                          <SelectValue>
                            {status.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <config.icon className="size-3.5" />
                                {config.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
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
