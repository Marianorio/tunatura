import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { supabaseAdmin, BUCKET_NAME, getPublicUrl } from "@/lib/supabase"
import { auth } from "@/server/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const processed = await sharp(buffer)
    .resize(600, 600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const ext = "webp"
  const fileName = `${session.user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, processed, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("Supabase upload error:", error)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }

  const url = getPublicUrl(fileName)

  return NextResponse.json({ url })
}
