import { auth } from "@/server/auth"

export async function getSession() {
  const session = await auth()
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}
