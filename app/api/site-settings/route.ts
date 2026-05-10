import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_DELIVERY_METHODS,
  normalizeDeliveryMethods,
  SITE_SETTING_DELIVERY_METHODS_KEY,
  SITE_SETTING_WHATSAPP_NUMBER_KEY,
} from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const whatsappResult = (await admin
      .from("site_settings")
      .select("value")
      .eq("key", SITE_SETTING_WHATSAPP_NUMBER_KEY)
      .maybeSingle()) as {
      data: { value?: string } | null
      error: { message: string } | null
    }
    const deliveryResult = (await admin
      .from("site_settings")
      .select("value")
      .eq("key", SITE_SETTING_DELIVERY_METHODS_KEY)
      .maybeSingle()) as {
      data: { value?: string } | null
      error: { message: string } | null
    }

    if (whatsappResult.error || deliveryResult.error) {
      return NextResponse.json(
        {
          whatsappNumber: "",
          deliveryMethods: DEFAULT_DELIVERY_METHODS,
        },
        { status: 200 }
      )
    }

    let parsedDeliveryMethods = DEFAULT_DELIVERY_METHODS
    if (typeof deliveryResult.data?.value === "string") {
      try {
        parsedDeliveryMethods = normalizeDeliveryMethods(JSON.parse(deliveryResult.data.value))
      } catch {
        parsedDeliveryMethods = DEFAULT_DELIVERY_METHODS
      }
    }

    return NextResponse.json({
      whatsappNumber: typeof whatsappResult.data?.value === "string" ? whatsappResult.data.value : "",
      deliveryMethods: parsedDeliveryMethods,
    })
  } catch {
    return NextResponse.json({ whatsappNumber: "", deliveryMethods: DEFAULT_DELIVERY_METHODS }, { status: 200 })
  }
}
