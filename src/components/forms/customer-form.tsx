"use client"

import { useState } from "react"
import { useForm, useController, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/forms/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer } from "@prisma/client"

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

const phoneRegex = /^(\+\d{2,3}-)?\d{3}-?\d+$/

const countries = [
  { code: "ARG", prefix: "+54", name: "Argentina" },
  { code: "BOL", prefix: "+591", name: "Bolivia" },
  { code: "BRA", prefix: "+55", name: "Brasil" },
  { code: "URU", prefix: "+598", name: "Uruguay" },
  { code: "PRY", prefix: "+595", name: "Paraguay" },
] as const

const defaultCountry = countries[0]

function detectCountry(value: string) {
  for (const c of countries) {
    if (value.startsWith(c.prefix)) return c
  }
  return defaultCountry
}

function formatPhoneWithPrefix(raw: string, prefix: string): string {
  if (!raw) return ""
  let cleaned = raw.replace(/[^\d+]/g, "")
  const plusCount = (cleaned.match(/\+/g) || []).length
  if (plusCount > 1) cleaned = "+" + cleaned.replace(/\+/g, "")
  if (cleaned.includes("+") && !cleaned.startsWith("+")) cleaned = "+" + cleaned.replace(/\+/g, "")
  if (cleaned && !cleaned.startsWith(prefix)) cleaned = prefix + cleaned.replace(/^\+/, "")
  const localPart = cleaned.slice(prefix.length)
  if (!localPart) return ""
  if (localPart.length <= 3) return prefix + "-" + localPart
  return prefix + "-" + localPart.slice(0, 3) + "-" + localPart.slice(3)
}

const customerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(nameRegex, "El nombre solo puede contener letras y espacios"),
  phone: z
    .string()
    .regex(phoneRegex, "Formato: 000-0000000")
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
  const defaultPhone = customer?.phone ?? ""
  const initialCountry = defaultPhone ? detectCountry(defaultPhone) : defaultCountry

  const [selectedCountry, setSelectedCountry] = useState(initialCountry)

  const form = useForm<CustomerFormValues>({
    mode: "onChange",
    resolver: zodResolver(customerSchema) as any,
    defaultValues: customer
      ? {
          name: customer.name,
          phone: defaultPhone ? formatPhoneWithPrefix(defaultPhone, initialCountry.prefix) : "",
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

  const { field: phoneField } = useController({
    control: form.control,
    name: "phone",
  })

  const {
    formState: { errors: phoneErrors },
  } = form

  function handleCountryChange(code: string) {
    const country = countries.find((c) => c.code === code) ?? defaultCountry
    const oldPrefix = selectedCountry.prefix
    const newPrefix = country.prefix
    const currentValue = phoneField.value ?? ""
    const localPart = currentValue.startsWith(oldPrefix)
      ? currentValue.slice(oldPrefix.length).replace(/^-/, "")
      : currentValue.replace(/^\+/, "")
    const newValue = localPart
      ? formatPhoneWithPrefix(newPrefix + localPart, newPrefix)
      : ""
    phoneField.onChange(newValue)
    setSelectedCountry(country)
  }

  function handlePhoneChange(raw: string) {
    for (const c of countries) {
      if (raw.startsWith(c.prefix)) {
        setSelectedCountry(c)
        phoneField.onChange(formatPhoneWithPrefix(raw, c.prefix))
        return
      }
    }
    phoneField.onChange(formatPhoneWithPrefix(raw, selectedCountry.prefix))
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
            <div className="flex gap-2">
              <Select
                value={selectedCountry.code}
                onValueChange={(v) => handleCountryChange(v ?? "ARG")}
              >
                <SelectTrigger className="w-24 shrink-0">
                  <SelectValue>
                    {selectedCountry.code}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} ({c.prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                placeholder="000-0000000"
                maxLength={24}
                value={phoneField.value ?? ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={phoneField.onBlur}
                ref={phoneField.ref}
                className={cn(
                  "flex-1",
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
            </div>
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
