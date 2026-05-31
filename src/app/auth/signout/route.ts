import { signOut } from "@/server/auth"
import { redirect } from "next/navigation"

export async function GET() {
  await signOut()
  redirect("/login")
}
