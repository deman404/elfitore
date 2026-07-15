import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_CONTACT_ADDRESS,
  DEFAULT_CONTACT_GOOGLE_MAPS_URL,
  DEFAULT_CONTACT_PHONE,
  formatWhatsAppNumberForLink,
  isValidWhatsAppNumber,
  normalizeDeliveryMethods,
  normalizeFreeShippingThreshold,
  buildGoogleMapsLink,
  formatPhoneNumberForLink,
  normalizeWhatsAppNumber,
  SITE_SETTING_CONTACT_ADDRESS_KEY,
  SITE_SETTING_CONTACT_GOOGLE_MAPS_URL_KEY,
  SITE_SETTING_CONTACT_PHONE_KEY,
  SITE_SETTING_DELIVERY_METHODS_KEY,
  SITE_SETTING_FREE_SHIPPING_THRESHOLD_KEY,
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

    const body = (await request.json()) as {
      whatsappNumber?: unknown
      contactPhone?: unknown
      contactAddress?: unknown
      contactGoogleMapsUrl?: unknown
      deliveryMethods?: unknown
      freeShippingThreshold?: unknown
    }
    const hasWhatsappUpdate = typeof body.whatsappNumber === "string" && body.whatsappNumber.trim().length > 0
    const hasContactPhoneUpdate = typeof body.contactPhone === "string" && body.contactPhone.trim().length > 0
    const hasContactAddressUpdate = typeof body.contactAddress === "string" && body.contactAddress.trim().length > 0
    const hasContactGoogleMapsUrlUpdate =
      typeof body.contactGoogleMapsUrl === "string" && body.contactGoogleMapsUrl.trim().length > 0
    const hasFreeShippingThresholdUpdate = body.freeShippingThreshold !== undefined
    const whatsappNumber = hasWhatsappUpdate ? normalizeWhatsAppNumber(String(body.whatsappNumber ?? "")) : ""
    const contactPhone = hasContactPhoneUpdate ? String(body.contactPhone ?? "").trim() : ""
    const contactAddress = hasContactAddressUpdate ? String(body.contactAddress ?? "").trim() : ""
    const contactGoogleMapsUrl = hasContactGoogleMapsUrlUpdate ? String(body.contactGoogleMapsUrl ?? "").trim() : ""
    const deliveryMethods = body.deliveryMethods === undefined ? null : normalizeDeliveryMethods(body.deliveryMethods ?? DEFAULT_DELIVERY_METHODS)
    const freeShippingThreshold = hasFreeShippingThresholdUpdate
      ? normalizeFreeShippingThreshold(body.freeShippingThreshold)
      : null

    if (hasFreeShippingThresholdUpdate && freeShippingThreshold === null) {
      return NextResponse.json(
        { error: "Enter a valid free shipping threshold of 0 or more." },
        { status: 400 }
      )
    }

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

    if (hasContactPhoneUpdate) {
      const { error: phoneError } = (await (admin.from("site_settings") as any).upsert(
        {
          key: SITE_SETTING_CONTACT_PHONE_KEY,
          value: formatPhoneNumberForLink(contactPhone) || DEFAULT_CONTACT_PHONE,
        },
        {
          onConflict: "key",
        }
      )) as {
        error: { message: string } | null
      }

      if (phoneError) {
        return NextResponse.json({ error: phoneError.message }, { status: 500 })
      }
    }

    if (hasContactAddressUpdate) {
      const { error: addressError } = (await (admin.from("site_settings") as any).upsert(
        {
          key: SITE_SETTING_CONTACT_ADDRESS_KEY,
          value: contactAddress || DEFAULT_CONTACT_ADDRESS,
        },
        {
          onConflict: "key",
        }
      )) as {
        error: { message: string } | null
      }

      if (addressError) {
        return NextResponse.json({ error: addressError.message }, { status: 500 })
      }
    }

    if (hasContactGoogleMapsUrlUpdate) {
      const { error: mapsError } = (await (admin.from("site_settings") as any).upsert(
        {
          key: SITE_SETTING_CONTACT_GOOGLE_MAPS_URL_KEY,
          value: buildGoogleMapsLink(contactGoogleMapsUrl, contactAddress || DEFAULT_CONTACT_ADDRESS),
        },
        {
          onConflict: "key",
        }
      )) as {
        error: { message: string } | null
      }

      if (mapsError) {
        return NextResponse.json({ error: mapsError.message }, { status: 500 })
      }
    }

    if (hasFreeShippingThresholdUpdate) {
      const { error: thresholdError } = (await (admin.from("site_settings") as any).upsert(
        {
          key: SITE_SETTING_FREE_SHIPPING_THRESHOLD_KEY,
          value: String(freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD),
        },
        {
          onConflict: "key",
        }
      )) as {
        error: { message: string } | null
      }

      if (thresholdError) {
        return NextResponse.json({ error: thresholdError.message }, { status: 500 })
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
      contactPhone: hasContactPhoneUpdate ? formatPhoneNumberForLink(contactPhone) : undefined,
      contactAddress: hasContactAddressUpdate ? contactAddress : undefined,
      contactGoogleMapsUrl: hasContactGoogleMapsUrlUpdate
        ? buildGoogleMapsLink(contactGoogleMapsUrl, contactAddress || DEFAULT_CONTACT_ADDRESS)
        : undefined,
      deliveryMethods: deliveryMethods ?? undefined,
      freeShippingThreshold: hasFreeShippingThresholdUpdate
        ? freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
        : undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update settings."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
