import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { NAV_LINKS } from "@/lib/constants"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const navItems = NAV_LINKS.map(({ label, href, icon }) => ({
    label,
    href,
    icon,
  }))

  return (
    <DashboardLayout navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
