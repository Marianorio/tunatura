import { auth } from "@/server/auth"
import { SettingsView } from "@/components/dashboard/settings-content"

export default async function SettingsRoute() {
  const session = await auth()

  return <SettingsView user={session?.user} />
}
