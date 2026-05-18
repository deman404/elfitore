import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const STORAGE_BUCKET = "theme-assets"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
]

const MAX_SIZE_MB = 50

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const folder = String(formData.get("folder") ?? "general").trim() || "general"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_SIZE_MB}MB.` },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdminClient()
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || "bin"
    const filePath = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    return NextResponse.json({ url: data.publicUrl, path: filePath })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
