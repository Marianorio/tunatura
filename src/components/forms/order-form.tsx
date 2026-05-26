"use client"

import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Customer, Product } from "@prisma/client"

type OrderItemForm = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export type OrderFormValues = {
  customerId: string
  notes?: string
  items: OrderItemForm[]
}

export function OrderForm({
  customers,
  products,
  onSubmit,
  isSubmitting,
}: {
  customers: Pick<Customer, "id" | "name">[]
  products: Pick<Product, "id" | "name" | "price">[]
  onSubmit: (values: OrderFormValues) => Promise<void>
  isSubmitting?: boolean
}) {
  const form = useForm<OrderFormValues>({
    defaultValues: {
      customerId: "",
      notes: "",
      items: [{ productId: "", productName: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const total = form.watch("items").reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0)
  }, 0)

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId)
    if (product) {
      form.setValue(`items.${index}.productId`, product.id)
      form.setValue(`items.${index}.productName`, product.name)
      form.setValue(`items.${index}.unitPrice`, Number(product.price))
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select
            value={form.watch("customerId")}
            onValueChange={(v) => form.setValue("customerId", v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Productos</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Select
                  value={form.watch(`items.${index}.productId`)}
                  onValueChange={(v) => handleProductSelect(index, v!)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${Number(p.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="Cant."
                  value={form.watch(`items.${index}.quantity`)}
                  onChange={(e) =>
                    form.setValue(
                      `items.${index}.quantity`,
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="w-24 pt-2 text-right text-sm font-medium">
                ${(
                  (form.watch(`items.${index}.quantity`) || 0) *
                  (form.watch(`items.${index}.unitPrice`) || 0)
                ).toFixed(2)}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              append({ productId: "", productName: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="mr-2 size-3" />
            Agregar producto
          </Button>
        </div>

        <div className="flex justify-between border-t pt-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-bold">${total.toFixed(2)}</span>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Creando..." : "Crear pedido"}
        </Button>
      </form>
    </FormProvider>
  )
}
