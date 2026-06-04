"use client"

import { useState, useMemo } from "react"
import { Plus, Trash2, Package, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { createCaja } from "@/server/cajas"
import { toast } from "sonner"

type CajaProduct = {
  productId: string
  productName: string
  cantidad: number
  fechaVencimiento: string
}

export function RegistrarCaja({
  products,
  onSuccess,
}: {
  products: { id: string; name: string; sku: string | null }[]
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [fechaRecibida, setFechaRecibida] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState<CajaProduct[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      ),
    [products, productSearch]
  )

  function addItem(productId: string) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    if (items.some((i) => i.productId === productId)) {
      toast.error("Este producto ya está en la caja")
      return
    }
    setItems([...items, { productId, productName: product.name, cantidad: 1, fechaVencimiento: "" }])
    setProductSearch("")
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof CajaProduct, value: string | number) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function resetForm() {
    setNombre("")
    setFechaRecibida(new Date().toISOString().split("T")[0])
    setItems([])
    setProductSearch("")
  }

  async function handleSubmit() {
    if (!nombre.trim()) {
      toast.error("Ingresa un nombre para la caja")
      return
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto a la caja")
      return
    }
    for (const item of items) {
      if (item.cantidad <= 0) {
        toast.error(`Cantidad inválida para "${item.productName}"`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      await createCaja(
        nombre.trim(),
        fechaRecibida,
        items.map((i) => ({
          productId: i.productId,
          cantidad: i.cantidad,
          fechaVencimiento: i.fechaVencimiento || null,
        }))
      )
      toast.success("Caja registrada correctamente")
      setOpen(false)
      resetForm()
      onSuccess()
    } catch (e) {
      toast.error("Error al registrar la caja")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Registrar caja
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar caja</DialogTitle>
            <DialogDescription>
              Registrá los productos recibidos en esta caja
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Nombre de la caja</label>
                <Input
                  placeholder="Ej: Caja 1, Tanda Mayo..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Fecha recibida</label>
                <Input
                  type="date"
                  value={fechaRecibida}
                  onChange={(e) => setFechaRecibida(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Agregar producto</label>
              <Select onValueChange={(v) => v && addItem(v)} value="">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="relative p-2 pb-0">
                    <Search className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.sku ? ` (${p.sku})` : ""}
                    </SelectItem>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                      Sin resultados
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Productos en esta caja</label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Package className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{item.productName}</span>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, "cantidad", Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-8 w-16 text-center text-xs"
                      />
                      <Input
                        type="date"
                        value={item.fechaVencimiento}
                        onChange={(e) => updateItem(index, "fechaVencimiento", e.target.value)}
                        className="h-8 w-36 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0 || !nombre.trim()}
            >
              {isSubmitting ? "Guardando..." : "Guardar caja"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
