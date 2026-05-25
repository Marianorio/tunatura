"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}

export function FormField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        {...register(name)}
      />
      {error && (
        <p className="text-xs text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
