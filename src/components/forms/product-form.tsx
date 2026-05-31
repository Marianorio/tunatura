"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Loader2 } from "lucide-react"

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
        },
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : product ? "Actualizar producto" : "Crear producto"}
        </Button>
      </form>
    </FormProvider>
  )
}
