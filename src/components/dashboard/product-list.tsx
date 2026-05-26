"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Plus, Package } from "lucide-react"
import type { Product } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm, type ProductFormValues } from "@/components/forms/product-form"
import { createProduct, updateProduct, deleteProduct, toggleProductStatus } from "@/server/products"
import { toast } from "sonner"

export function ProductList({ products: initial }: { products: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initial)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  async function handleCreate(values: ProductFormValues) {
    setIsSubmitting(true)
    try {
      await createProduct(values)
      toast.success("Producto creado correctamente")
      setIsDialogOpen(false)
      refresh()
    } catch {
      toast.error("Error al crear el producto")
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
      refresh()
    } catch {
      toast.error("Error al actualizar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return
    try {
      await deleteProduct(id)
      toast.success("Producto eliminado correctamente")
      refresh()
    } catch {
      toast.error("Error al eliminar el producto")
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await toggleProductStatus(id)
      refresh()
    } catch {
      toast.error("Error al cambiar el estado del producto")
    }
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  function openCreate() {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu catálogo de productos
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

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Package className="mb-4 size-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No hay productos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Agrega tu primer producto para empezar
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Nuevo producto
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Precio</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
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
