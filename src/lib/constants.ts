export const APP_NAME = "Tu Natura"
export const APP_DESCRIPTION = "Plataforma profissional para consultores Natura independentes"

export const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Produtos", href: "/dashboard/products", icon: "Package" },
  { label: "Clientes", href: "/dashboard/customers", icon: "Users" },
  { label: "Pedidos", href: "/dashboard/orders", icon: "ShoppingCart" },
  { label: "Vendas", href: "/dashboard/sales", icon: "TrendingUp" },
  { label: "Configurações", href: "/dashboard/settings", icon: "Settings" },
] as const

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
