import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db"
import bcrypt from "bcryptjs"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, password: true, role: true },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "user"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? "user"
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
