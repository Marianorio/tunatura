"use client"

import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export { z }

export function Form({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel = "Salvar",
  submittingLabel = "Salvando...",
  isSubmitting: externalSubmitting,
}: {
  schema: z.ZodType
  defaultValues?: FieldValues
  onSubmit: (values: FieldValues) => Promise<void> | void
  children: (form: UseFormReturn<FieldValues>) => React.ReactNode
  submitLabel?: string
  submittingLabel?: string
  isSubmitting?: boolean
}) {
  const form = useForm<FieldValues>({
    defaultValues,
  })

  const isSubmitting = externalSubmitting ?? form.formState.isSubmitting

  async function handleSubmit(values: FieldValues) {
    const result = schema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, { message: string; type: string }> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = { message: issue.message, type: "validation" }
        }
      }
      for (const [key, error] of Object.entries(fieldErrors)) {
        form.setError(key, error)
      }
      return
    }
    await onSubmit(result.data as FieldValues)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {children(form)}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  )
}
