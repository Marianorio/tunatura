"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Loader2 } from "lucide-react"
import type { Customer } from "@prisma/client"

const customerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
})

export type CustomerFormValues = {
  name: string
  phone?: string
}

export function CustomerForm({
  customer,
  onSubmit,
  isSubmitting,
}: {
  customer?: Customer
  onSubmit: (values: CustomerFormValues) => Promise<void>
  isSubmitting?: boolean
}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone ?? "",
        }
      : {
          name: "",
          phone: "",
        },
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          label="Nombre"
          placeholder="Nombre del cliente"
          required
        />
        <FormField
          name="phone"
          label="Teléfono"
          placeholder="+54 11 1234-5678"
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : customer ? "Actualizar cliente" : "Crear cliente"}
        </Button>
      </form>
    </FormProvider>
  )
}
