export const APP_NAME = "Tu Natura"
export const APP_DESCRIPTION = "Plataforma profesional para consultores Natura independientes"

export const NAV_LINKS = [
  { label: "Inicio", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Productos", href: "/dashboard/products", icon: "Package" },
  { label: "Clientes", href: "/dashboard/customers", icon: "Users" },
  { label: "Pedidos", href: "/dashboard/orders", icon: "ShoppingCart" },
  { label: "Deudas", href: "/dashboard/debts", icon: "DollarSign" },
  { label: "Ventas", href: "/dashboard/sales", icon: "TrendingUp" },
  { label: "Configuración", href: "/dashboard/settings", icon: "Settings" },
] as const

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
