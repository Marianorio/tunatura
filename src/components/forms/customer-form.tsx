"use client"

import { useForm, useController, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/forms/form-field"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer } from "@prisma/client"

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

const phoneRegex = /^(\+\d{2}-)?\d{3}-\d{7}$/

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "El nombre solo puede contener letras y espacios"),
  phone: z
    .string()
    .regex(phoneRegex, "Formato: +54-000-0000000 o 000-0000000")
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

function formatPhone(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, "")
  const plusCount = (cleaned.match(/\+/g) || []).length
  if (plusCount > 1) cleaned = "+" + cleaned.replace(/\+/g, "")
  if (cleaned.includes("+") && !cleaned.startsWith("+")) cleaned = "+" + cleaned.replace(/\+/g, "")
  const digits = cleaned.replace(/-/g, "")
  if (digits.startsWith("+")) {
    const rest = digits.slice(1)
    if (rest.length <= 2) return "+" + rest
    if (rest.length <= 5) return "+" + rest.slice(0, 2) + "-" + rest.slice(2)
    return "+" + rest.slice(0, 2) + "-" + rest.slice(2, 5) + "-" + rest.slice(5, 12)
  }
  if (digits.length <= 3) return digits
  return digits.slice(0, 3) + "-" + digits.slice(3, 10)
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

  const { field: phoneField, fieldState: phoneState } = useController({
    control: form.control,
    name: "phone",
  })

  const {
    formState: { errors: phoneErrors },
  } = form

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
              placeholder="+54-000-0000000"
              maxLength={16}
              value={phoneField.value ?? ""}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                phoneField.onChange(formatted)
              }}
              onBlur={phoneField.onBlur}
              ref={phoneField.ref}
              className={cn(
                phoneField.value &&
                  phoneField.value.length > 0 &&
                  phoneRegex.test(phoneField.value) &&
                  "border-green-500 focus-visible:ring-green-500",
                phoneField.value &&
                  phoneField.value.length > 0 &&
                  !phoneRegex.test(phoneField.value) &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {phoneErrors.phone && (
              <p className="text-xs text-destructive">
                {phoneErrors.phone.message as string}
              </p>
            )}
            {phoneField.value && phoneRegex.test(phoneField.value) && (
              <p className="text-xs text-green-600">Número válido</p>
            )}
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
