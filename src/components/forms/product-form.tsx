"use client"

import { useState, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
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

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

const productSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "El nombre solo puede contener letras y espacios"),
  brand: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  costPrice: z.coerce.number().min(0).optional(),
  expirationDate: z.string().optional(),
  category: z.string().optional(),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  image: z.string().optional(),
  barcode: z.string().optional(),
})

export type ProductFormValues = {
  name: string
  brand?: string
  description?: string
  price: number
  costPrice?: number
  expirationDate?: string
  category?: string
  stock: number
  image?: string
  barcode?: string
}

export function ProductForm({
  product,
  onSubmit,
  isSubmitting,
}: {
  product?: SerializedProduct
  onSubmit: (values: ProductFormValues) => Promise<void>
  isSubmitting?: boolean
}) {
  const [imageUrl, setImageUrl] = useState(product?.image ?? "")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProductFormValues>({
    mode: "onChange",
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          brand: product.brand ?? "",
          description: product.description ?? "",
          price: Number(product.price),
          costPrice: product.costPrice ? Number(product.costPrice) : undefined,
          expirationDate: product.expirationDate
            ? new Date(product.expirationDate).toISOString().split("T")[0]
            : "",
          category: product.category ?? "",
          stock: product.stock,
          image: product.image ?? "",
          barcode: product.barcode ?? "",
        }
      : {
          name: "",
          brand: "",
          description: "",
          price: undefined as unknown as number,
          costPrice: undefined as unknown as number,
          expirationDate: "",
          category: "",
          stock: undefined as unknown as number,
          image: "",
          barcode: "",
        },
  })

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setImageUrl(data.url)
      form.setValue("image", data.url)
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagen del producto</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
              "hover:border-accent hover:bg-accent/5",
              imageUrl ? "border-muted-foreground/20" : "border-muted-foreground/30"
            )}
          >
            {imageUrl ? (
              <div className="relative w-full">
                <div className="relative mx-auto size-32 overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageUrl("")
                    form.setValue("image", "")
                  }}
                  className="absolute -top-2 right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="size-8" />
                <p className="text-sm font-medium">
                  {uploading ? "Subiendo..." : "Haz clic para subir imagen"}
                </p>
                <p className="text-xs">WebP · Máx 600x600px</p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                <Loader2 className="size-6 animate-spin text-accent" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <FormField
          name="name"
          label="Nombre"
          placeholder="Nombre del producto"
          required
        />
        <FormField
          name="brand"
          label="Marca"
          placeholder="Ej: Natura, Avon..."
        />
        <FormField
          name="description"
          label="Descripción"
          placeholder="Descripción del producto"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="price"
            label="Precio de venta"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
          <FormField
            name="costPrice"
            label="Precio de costo"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="expirationDate"
            label="Fecha de vencimiento"
            type="date"
          />
          <FormField
            name="category"
            label="Categoría"
            placeholder="Ej: Perfumes, Maquillaje..."
          />
        </div>
        <FormField
          name="stock"
          label="Stock"
          type="number"
          placeholder="0"
          required
        />
        <FormField
          name="barcode"
          label="Código de barras"
          placeholder="Ej: 1234567890123"
        />
        <Button type="submit" disabled={isSubmitting || uploading} className="w-full">
          {(isSubmitting || uploading) && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : product ? "Actualizar producto" : "Crear producto"}
        </Button>
      </form>
    </FormProvider>
  )
}
