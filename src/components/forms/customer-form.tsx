"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Loader2 } from "lucide-react"
import type { Customer } from "@prisma/client"

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "El nombre solo puede contener letras y espacios"),
  phone: z
    .string()
    .regex(/^\+\d{2} \d{3} \d{1,7}$/, "Formato: +54 911 1234567")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export type CustomerFormValues = {
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
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
          email: customer.email ?? "",
          address: customer.address ?? "",
          notes: customer.notes ?? "",
        }
      : {
          name: "",
          phone: "",
          email: "",
          address: "",
          notes: "",
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="phone"
            label="Teléfono"
            placeholder="+54 11 1234-5678"
          />
          <FormField
            name="email"
            label="Email"
            type="email"
            placeholder="cliente@email.com"
          />
        </div>
        <FormField
          name="address"
          label="Dirección"
          placeholder="Dirección del cliente"
        />
        <FormField
          name="notes"
          label="Notas"
          placeholder="Notas adicionales..."
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isSubmitting ? "Guardando..." : customer ? "Actualizar cliente" : "Crear cliente"}
        </Button>
      </form>
    </FormProvider>
  )
}
