"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Loader2 } from "lucide-react"

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

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  costPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  image: z.string().optional(),
})

export type ProductFormValues = {
  name: string
  description?: string
  price: number
  costPrice?: number
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
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          costPrice: product.costPrice ? Number(product.costPrice) : 0,
          category: product.category ?? "",
          stock: product.stock,
          image: product.image ?? "",
        }
      : {
          name: "",
          description: "",
          price: 0,
          costPrice: 0,
          category: "",
          stock: 0,
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
            name="category"
            label="Categoría"
            placeholder="Ej: Perfumes, Maquillaje..."
          />
          <FormField
            name="stock"
            label="Stock"
            type="number"
            placeholder="0"
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : product ? "Actualizar producto" : "Crear producto"}
        </Button>
      </form>
    </FormProvider>
  )
}
