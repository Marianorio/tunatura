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
