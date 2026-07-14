import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_CONTACT_ADDRESS,
  DEFAULT_CONTACT_GOOGLE_MAPS_URL,
  DEFAULT_CONTACT_PHONE,
  DEFAULT_CONTACT_WHATSAPP_NUMBER,
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  SITE_SETTING_CONTACT_ADDRESS_KEY,
  SITE_SETTING_CONTACT_GOOGLE_MAPS_URL_KEY,
  SITE_SETTING_CONTACT_PHONE_KEY,
  normalizeDeliveryMethods,
  normalizeFreeShippingThreshold,
  SITE_SETTING_DELIVERY_METHODS_KEY,
  SITE_SETTING_FREE_SHIPPING_THRESHOLD_KEY,
  SITE_SETTING_WHATSAPP_NUMBER_KEY,
} from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const siteSettings = admin.from("site_settings") as any
    const [whatsappResult, phoneResult, addressResult, mapsResult, deliveryResult, shippingResult] = await Promise.all([
      siteSettings.select("value").eq("key", SITE_SETTING_WHATSAPP_NUMBER_KEY).maybeSingle(),
      siteSettings.select("value").eq("key", SITE_SETTING_CONTACT_PHONE_KEY).maybeSingle(),
      siteSettings.select("value").eq("key", SITE_SETTING_CONTACT_ADDRESS_KEY).maybeSingle(),
      siteSettings.select("value").eq("key", SITE_SETTING_CONTACT_GOOGLE_MAPS_URL_KEY).maybeSingle(),
      siteSettings.select("value").eq("key", SITE_SETTING_DELIVERY_METHODS_KEY).maybeSingle(),
      siteSettings.select("value").eq("key", SITE_SETTING_FREE_SHIPPING_THRESHOLD_KEY).maybeSingle(),
    ])

    if (whatsappResult.error || phoneResult.error || addressResult.error || mapsResult.error || deliveryResult.error || shippingResult.error) {
      return NextResponse.json(
        {
          whatsappNumber: DEFAULT_CONTACT_WHATSAPP_NUMBER,
          contactPhone: DEFAULT_CONTACT_PHONE,
          contactAddress: DEFAULT_CONTACT_ADDRESS,
          contactGoogleMapsUrl: DEFAULT_CONTACT_GOOGLE_MAPS_URL,
          deliveryMethods: DEFAULT_DELIVERY_METHODS,
          freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
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

    const parsedFreeShippingThreshold =
      normalizeFreeShippingThreshold(shippingResult.data?.value ?? DEFAULT_FREE_SHIPPING_THRESHOLD) ??
      DEFAULT_FREE_SHIPPING_THRESHOLD

    return NextResponse.json({
      whatsappNumber: typeof whatsappResult.data?.value === "string" ? whatsappResult.data.value : DEFAULT_CONTACT_WHATSAPP_NUMBER,
      contactPhone: typeof phoneResult.data?.value === "string" ? phoneResult.data.value : DEFAULT_CONTACT_PHONE,
      contactAddress: typeof addressResult.data?.value === "string" ? addressResult.data.value : DEFAULT_CONTACT_ADDRESS,
      contactGoogleMapsUrl: typeof mapsResult.data?.value === "string" ? mapsResult.data.value : DEFAULT_CONTACT_GOOGLE_MAPS_URL,
      deliveryMethods: parsedDeliveryMethods,
      freeShippingThreshold: parsedFreeShippingThreshold,
    })
  } catch {
    return NextResponse.json(
      {
        whatsappNumber: DEFAULT_CONTACT_WHATSAPP_NUMBER,
        contactPhone: DEFAULT_CONTACT_PHONE,
        contactAddress: DEFAULT_CONTACT_ADDRESS,
        contactGoogleMapsUrl: DEFAULT_CONTACT_GOOGLE_MAPS_URL,
        deliveryMethods: DEFAULT_DELIVERY_METHODS,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      },
      { status: 200 }
    )
  }
}
