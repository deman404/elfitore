import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const STORAGE_BUCKET = "product-images"

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before uploading images." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const productName = String(formData.get("productName") ?? "product").trim() || "product"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = `products/${crypto.randomUUID()}-${productName.toLowerCase().replace(/\s+/g, "-")}-${file.name.replace(/\s+/g, "-")}`

    const { error: uploadError } = await admin.storage.from(STORAGE_BUCKET).upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload image."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
