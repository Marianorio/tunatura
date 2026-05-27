"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Plus, Users, Search } from "lucide-react"
import type { Customer } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CustomerForm, type CustomerFormValues } from "@/components/forms/customer-form"
import { createCustomer, updateCustomer, deleteCustomer } from "@/server/customers"
import { toast } from "sonner"

export function CustomerList({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q)
        )
      }),
    [customers, search]
  )

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  async function handleCreate(values: CustomerFormValues) {
    setIsSubmitting(true)
    try {
      await createCustomer(values)
      toast.success("Cliente creado correctamente")
      setIsDialogOpen(false)
      refresh()
    } catch {
      toast.error("Error al crear el cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: CustomerFormValues) {
    if (!editingCustomer) return
    setIsSubmitting(true)
    try {
      await updateCustomer(editingCustomer.id, values)
      toast.success("Cliente actualizado correctamente")
      setEditingCustomer(null)
      setIsDialogOpen(false)
      refresh()
    } catch {
      toast.error("Error al actualizar el cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return
    try {
      await deleteCustomer(id)
      toast.success("Cliente eliminado correctamente")
      refresh()
    } catch {
      toast.error("Error al eliminar el cliente")
    }
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  function openCreate() {
    setEditingCustomer(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu base de clientes ({filtered.length} de {customers.length})
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo cliente
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Editar cliente" : "Nuevo cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? "Actualiza los datos del cliente"
                  : "Agrega un nuevo cliente"}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer ?? undefined}
              onSubmit={editingCustomer ? handleUpdate : handleCreate}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Users className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">
            {search ? "Sin resultados" : "No hay clientes"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Intenta con otro término de búsqueda"
              : "Agrega tu primer cliente para empezar"}
          </p>
          {!search && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Nuevo cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Dirección</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {customer.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {customer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                    {customer.address ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(customer)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
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
