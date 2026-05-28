"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer } from "@prisma/client"

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "El nombre solo puede contener letras y espacios"),
  phone: z
    .string()
    .regex(/^(\+\d{2}-)?\d{3}-\d{7}$/, "Formato: +54-362-1234567 o 362-1234567")
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
    mode: "onChange",
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

  const phoneValue = form.watch("phone") ?? ""
  const phoneError = form.formState.errors.phone

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value
    value = value.replace(/[^\d+-]/g, "")
    const plusCount = (value.match(/\+/g) || []).length
    if (plusCount > 1) {
      value = value.replace(/\+/g, "")
      value = "+" + value
    }
    if (value.includes("+") && value.indexOf("+") !== 0) {
      value = value.replace(/\+/g, "")
      value = "+" + value
    }
    form.setValue("phone", value, { shouldValidate: true })
  }

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
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="text"
              placeholder="+54-362-1234567"
              maxLength={16}
              value={phoneValue}
              onChange={handlePhoneChange}
              aria-invalid={!!phoneError}
              className={cn(
                phoneValue.length > 0 && !phoneError && "border-green-600",
                phoneError && "border-destructive"
              )}
            />
            {phoneError && (
              <p className="text-xs text-destructive">{phoneError.message as string}</p>
            )}
            {phoneValue.length > 0 && !phoneError && (
              <p className="text-xs text-green-600">Número válido</p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: +54-362-1234567 o 362-1234567
            </p>
          </div>
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
