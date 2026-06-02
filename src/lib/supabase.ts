import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

export const BUCKET_NAME = "product-images"

export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}
