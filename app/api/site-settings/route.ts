import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { SITE_SETTING_WHATSAPP_NUMBER_KEY } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = (await admin
      .from("site_settings")
      .select("value")
      .eq("key", SITE_SETTING_WHATSAPP_NUMBER_KEY)
      .maybeSingle()) as {
      data: { value?: string } | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ whatsappNumber: "" }, { status: 200 })
    }

    return NextResponse.json({
      whatsappNumber: typeof data?.value === "string" ? data.value : "",
    })
  } catch {
    return NextResponse.json({ whatsappNumber: "" }, { status: 200 })
  }
}
