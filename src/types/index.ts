import type { Product } from "@prisma/client"

export type NavLink = {
  label: string
  href: string
  icon: string
}

export type UserRole = "admin" | "user"

export type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
}

export type DashboardCardProps = {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    positive: boolean
  }
}

export type SidebarState = "expanded" | "collapsed"

export type ProductFormData = {
  name: string
  brand?: string
  description?: string
  price: number
  costPrice?: number
  expirationDate?: string
  category?: string
  stock: number
  image?: string
  barcode?: string
}

export type ProductWithRelations = Product
