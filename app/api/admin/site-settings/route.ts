import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  formatWhatsAppNumberForLink,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
  SITE_SETTING_WHATSAPP_NUMBER_KEY,
} from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating settings." }, { status: 401 })
    }

    const body = (await request.json()) as { whatsappNumber?: unknown }
    const whatsappNumber = normalizeWhatsAppNumber(String(body.whatsappNumber ?? ""))

    if (!isValidWhatsAppNumber(whatsappNumber)) {
      return NextResponse.json(
        { error: "Enter a valid WhatsApp number with 8 to 15 digits, including the country code." },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("site_settings") as any).upsert(
      {
        key: SITE_SETTING_WHATSAPP_NUMBER_KEY,
        value: formatWhatsAppNumberForLink(whatsappNumber),
      },
      {
        onConflict: "key",
      }
    )) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      whatsappNumber: formatWhatsAppNumberForLink(whatsappNumber),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update settings."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
