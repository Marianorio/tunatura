"use client"

import { useState, useMemo, useEffect } from "react"
import { Pencil, Trash2, Plus, Package, Search, Tag, AlertTriangle, CheckCircle2, ImageIcon, ChevronLeft, ChevronRight, Box, Calendar, Trash } from "lucide-react"
import Image from "next/image"
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
import { ProductForm, type ProductFormValues } from "@/components/forms/product-form"
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus } from "@/server/products"
import { getCajas, deleteCaja } from "@/server/cajas"
import { RegistrarCaja } from "@/components/forms/registrar-caja"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SerializedProduct = {
  id: string
  sku: string | null
  name: string
  brand: string | null
  price: number
  costPrice: number | null
  stock: number
  isActive: boolean
  category: string | null
  description: string | null
  expirationDate: Date | null
  image: string | null
  barcode: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function ProductList({ products: initial, initialCajas }: { products: SerializedProduct[], initialCajas: any[] }) {
  const [products, setProducts] = useState(initial)
  const [cajas, setCajas] = useState(initialCajas)
  const [cajaPage, setCajaPage] = useState(1)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeCount = products.filter((p) => p.isActive).length
  const lowStockCount = products.filter((p) => p.isActive && p.stock > 0 && p.stock <= 5).length
  const outOfStockCount = products.filter((p) => p.isActive && p.stock === 0).length

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
        )
      }),
    [products, search]
  )

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  useEffect(() => { setPage(1) }, [search])

  async function refresh() {
    const data = await getProducts()
    setProducts(data)
  }

  async function refreshCajas() {
    const data = await getCajas()
    setCajas(data)
  }

  async function handleDeleteCaja(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta caja? El stock se descontará automáticamente.")) return
    try {
      await deleteCaja(id)
      toast.success("Caja eliminada")
      await refreshCajas()
      await refresh()
    } catch (e) {
      toast.error("Error al eliminar la caja")
      console.error(e)
    }
  }

  async function handleCreate(values: ProductFormValues) {
    setIsSubmitting(true)
    try {
      await createProduct(values)
      toast.success("Producto creado correctamente")
      setIsDialogOpen(false)
      await refresh()
    } catch (e) {
      toast.error("Error al crear el producto")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: ProductFormValues) {
    if (!editingProduct) return
    setIsSubmitting(true)
    try {
      await updateProduct(editingProduct.id, values)
      toast.success("Producto actualizado correctamente")
      setEditingProduct(null)
      setIsDialogOpen(false)
      await refresh()
    } catch (e) {
      toast.error("Error al actualizar el producto")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return
    try {
      await deleteProduct(id)
      toast.success("Producto eliminado correctamente")
      await refresh()
    } catch (e) {
      toast.error("Error al eliminar el producto")
      console.error(e)
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await toggleProductStatus(id)
      await refresh()
    } catch (e) {
      toast.error("Error al cambiar el estado del producto")
      console.error(e)
    }
  }

  function openEdit(product: SerializedProduct) {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  function openCreate() {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RegistrarCaja products={products} onSuccess={() => { refreshCajas(); refresh() }} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Actualiza los datos del producto"
                  : "Agrega un nuevo producto a tu catálogo"}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={editingProduct ?? undefined}
              onSubmit={editingProduct ? handleUpdate : handleCreate}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Activos</p>
          <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Stock bajo</p>
          <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Agotados</p>
          <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, SKU, marca o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16">
          <Package className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">
            {search ? "Sin resultados" : "No hay productos"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Intenta con otro término de búsqueda"
              : "Agrega tu primer producto para empezar"}
          </p>
          {!search && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Nuevo producto
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {paginated.map((product) => (
              <div key={product.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <ImageIcon className="size-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[product.sku, product.brand].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">${Number(product.price).toFixed(2)}</span>
                  <span className={cn("text-sm", product.stock === 0 ? "text-red-600 font-medium" : product.stock <= 5 ? "text-amber-600 font-medium" : "")}>
                    {product.stock === 0 && <AlertTriangle className="inline size-3.5 mr-1" />}
                    {product.stock > 0 && product.stock <= 5 && <AlertTriangle className="inline size-3.5 mr-1" />}
                    {product.stock} uds.
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleStatus(product.id)}
                  >
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(product)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">SKU</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Marca</th>
                <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Categoría</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr key={product.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-2 py-3.5 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-4 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {product.sku ?? ""}{product.sku && product.brand ? " · " : ""}{product.brand ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden lg:hidden">
                          {product.category ?? ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs font-mono text-muted-foreground sm:table-cell">
                    {product.sku ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {product.brand ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm text-muted-foreground lg:table-cell">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className={cn("px-4 py-3.5 text-right text-sm", product.stock === 0 && "text-red-600 font-medium")}>
                    <span className={cn(
                      "inline-flex items-center gap-1",
                      product.stock === 0 && "text-red-600",
                      product.stock > 0 && product.stock <= 5 && "text-amber-600"
                    )}>
                      {product.stock === 0 && <AlertTriangle className="size-3.5" />}
                      {product.stock > 0 && product.stock <= 5 && <AlertTriangle className="size-3.5" />}
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className="inline-flex cursor-pointer items-center gap-1"
                      onClick={() => handleToggleStatus(product.id)}
                    >
                      {product.isActive ? <CheckCircle2 className="size-3" /> : null}
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDelete(product.id)}
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

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Box className="size-4 text-muted-foreground" />
            Cajas recibidas
            {cajas.length > 0 && (
              <Badge variant="secondary" className="ml-1">{cajas.length}</Badge>
            )}
          </h3>
        </div>
        {cajas.length > 0 ? (
          <div className="space-y-3">
            {cajas
              .slice((cajaPage - 1) * 3, cajaPage * 3)
              .map((caja) => {
              const totalItems = caja.items.reduce((s: number, i: any) => s + i.cantidad, 0)
              return (
                <div key={caja.id} className="rounded-lg border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{caja.nombre}</span>
                      <Badge variant="secondary" className="text-xs">
                        {totalItems} uds.
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="mr-1 inline size-3" />
                        {new Date(caja.fechaRecibida).toLocaleDateString("es-AR")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeleteCaja(caja.id)}
                      >
                        <Trash className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {caja.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.product.name}</span>
                        <div className="flex items-center gap-3">
                          {item.fechaVencimiento && (
                            <span className="text-xs text-muted-foreground">
                              Vence: {new Date(item.fechaVencimiento).toLocaleDateString("es-AR")}
                            </span>
                          )}
                          <span className="font-medium">{item.cantidad} uds.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {cajas.length > 3 && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  Página {cajaPage} de {Math.ceil(cajas.length / 3)}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-7" disabled={cajaPage <= 1} onClick={() => setCajaPage(cajaPage - 1)}>
                    <ChevronLeft className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-7" disabled={cajaPage >= Math.ceil(cajas.length / 3)} onClick={() => setCajaPage(cajaPage + 1)}>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            <Package className="mb-2 size-8 text-muted-foreground/50" />
            No hay cajas registradas
          </div>
        )}
      </div>
    </div>
  )
}
