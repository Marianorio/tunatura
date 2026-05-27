"use client"

import { useState, useMemo } from "react"
import { Pencil, Trash2, Plus, Package, Search } from "lucide-react"
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
  userId: string
  createdAt: Date
  updatedAt: Date
}

export function ProductList({ products: initial }: { products: SerializedProduct[] }) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
        )
      }),
    [products, search]
  )

  async function refresh() {
    const data = await getProducts()
    setProducts(data)
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
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu catálogo de productos ({filtered.length} de {products.length})
          </p>
        </div>
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
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
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Producto</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">Categoría</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Precio</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {product.category ?? "Sin categoría"}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className={cn("px-4 py-3 text-right text-sm", product.stock === 0 && "text-destructive")}>
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(product.id)}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
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
