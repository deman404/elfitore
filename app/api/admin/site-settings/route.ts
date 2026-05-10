import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_DELIVERY_METHODS,
  formatWhatsAppNumberForLink,
  isValidWhatsAppNumber,
  normalizeDeliveryMethods,
  normalizeWhatsAppNumber,
  SITE_SETTING_DELIVERY_METHODS_KEY,
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

    const body = (await request.json()) as { whatsappNumber?: unknown; deliveryMethods?: unknown }
    const hasWhatsappUpdate = typeof body.whatsappNumber === "string" && body.whatsappNumber.trim().length > 0
    const whatsappNumber = hasWhatsappUpdate ? normalizeWhatsAppNumber(String(body.whatsappNumber ?? "")) : ""
    const deliveryMethods = body.deliveryMethods === undefined ? null : normalizeDeliveryMethods(body.deliveryMethods ?? DEFAULT_DELIVERY_METHODS)

    const admin = getSupabaseAdminClient()
    if (hasWhatsappUpdate) {
      if (!isValidWhatsAppNumber(whatsappNumber)) {
        return NextResponse.json(
          { error: "Enter a valid WhatsApp number with 8 to 15 digits, including the country code." },
          { status: 400 }
        )
      }

      const { error: whatsappError } = (await (admin.from("site_settings") as any).upsert(
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

      if (whatsappError) {
        return NextResponse.json({ error: whatsappError.message }, { status: 500 })
      }
    }

    if (deliveryMethods !== null) {
      const { error: deliveryError } = (await (admin.from("site_settings") as any).upsert(
        {
          key: SITE_SETTING_DELIVERY_METHODS_KEY,
          value: JSON.stringify(deliveryMethods),
        },
        {
          onConflict: "key",
        }
      )) as {
        error: { message: string } | null
      }

      if (deliveryError) {
        return NextResponse.json({ error: deliveryError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      whatsappNumber: hasWhatsappUpdate ? formatWhatsAppNumberForLink(whatsappNumber) : undefined,
      deliveryMethods: deliveryMethods ?? undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update settings."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
