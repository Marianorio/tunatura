"use client"

import { useState, useMemo } from "react"
import { Trash2, Plus, ShoppingCart, Search } from "lucide-react"
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

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  delivered: "outline",
  cancelled: "destructive",
}

export function OrderList({
  orders: initial,
  customers,
  products,
}: {
  orders: SerializedOrder[]
  customers: Pick<Customer, "id" | "name">[]
  products: { id: string; name: string; price: number }[]
}) {
  const [orders, setOrders] = useState(initial)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Seguimiento de todos los pedidos realizados ({filtered.length} de {orders.length})
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar pedidos (número, cliente, producto)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Pedido</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">Productos</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{order.customer.name}</td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate md:table-cell">
                    {order.items.map((i) => i.product.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Select
                      value={order.status ?? "pending"}
                      onValueChange={(v) => handleStatusChange(order.id, v ?? "pending")}
                    >
                      <SelectTrigger className="h-7 w-fit gap-1 border-0 px-2 text-xs font-medium">
                        <Badge variant={statusVariants[order.status] ?? "secondary"}>
                          <SelectValue />
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
