"use client"

import { useState, useMemo } from "react"
import { Pencil, Trash2, Plus, Users, Search, Phone, Mail, MapPin, UserCheck } from "lucide-react"
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
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/server/customers"
import { toast } from "sonner"

export function CustomerList({ customers: initial }: { customers: Customer[] }) {
  const [customers, setCustomers] = useState(initial)
  const [search, setSearch] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const withPhone = customers.filter((c) => c.phone).length
  const withEmail = customers.filter((c) => c.email).length

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

  async function refresh() {
    const data = await getCustomers()
    setCustomers(data)
  }

  async function handleCreate(values: CustomerFormValues) {
    setIsSubmitting(true)
    try {
      await createCustomer(values)
      toast.success("Cliente creado correctamente")
      setIsDialogOpen(false)
      await refresh()
    } catch (e) {
      toast.error("Error al crear el cliente")
      console.error(e)
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
      await refresh()
    } catch (e) {
      toast.error("Error al actualizar el cliente")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return
    try {
      await deleteCustomer(id)
      toast.success("Cliente eliminado correctamente")
      await refresh()
    } catch (e) {
      toast.error("Error al eliminar el cliente")
      console.error(e)
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu base de clientes
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <p className="mt-1 text-xl font-bold">{customers.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Con teléfono</p>
          </div>
          <p className="mt-1 text-xl font-bold">{withPhone}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Con email</p>
          </div>
          <p className="mt-1 text-xl font-bold">{withEmail}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16">
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
        <>
          <div className="grid gap-3 sm:hidden">
            {filtered.map((customer) => (
              <div key={customer.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{customer.name}</p>
                    {customer.phone && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        {customer.phone}
                      </p>
                    )}
                    {customer.email && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="size-3" />
                        {customer.email}
                      </p>
                    )}
                    {customer.address && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {customer.address}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEdit(customer)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-sm sm:block">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Email</th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Dirección</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <UserCheck className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {customer.phone || "Sin teléfono"}{customer.email ? ` · ${customer.email}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {customer.phone ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                      {customer.email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3" />
                          {customer.email}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-muted-foreground lg:table-cell">
                      {customer.address ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {customer.address}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(customer)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
