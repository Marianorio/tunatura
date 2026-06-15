import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
