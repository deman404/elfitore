import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_CTA_BANNER, type ThemeCtaBannerData } from "@/lib/theme-cta-banner"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the CTA banner." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeCtaBannerData
    const payload = {
      id: 1,
      background_image_url: body.backgroundImageUrl.trim() || DEFAULT_THEME_CTA_BANNER.backgroundImageUrl,
      title1_en: body.title1.en.trim() || DEFAULT_THEME_CTA_BANNER.title1.en,
      title1_fr: body.title1.fr.trim() || DEFAULT_THEME_CTA_BANNER.title1.fr,
      title1_ar: body.title1.ar.trim() || DEFAULT_THEME_CTA_BANNER.title1.ar,
      title2_en: body.title2.en.trim() || DEFAULT_THEME_CTA_BANNER.title2.en,
      title2_fr: body.title2.fr.trim() || DEFAULT_THEME_CTA_BANNER.title2.fr,
      title2_ar: body.title2.ar.trim() || DEFAULT_THEME_CTA_BANNER.title2.ar,
      leaf_en: body.leaf.en.trim() || DEFAULT_THEME_CTA_BANNER.leaf.en,
      leaf_fr: body.leaf.fr.trim() || DEFAULT_THEME_CTA_BANNER.leaf.fr,
      leaf_ar: body.leaf.ar.trim() || DEFAULT_THEME_CTA_BANNER.leaf.ar,
      flower_en: body.flower.en.trim() || DEFAULT_THEME_CTA_BANNER.flower.en,
      flower_fr: body.flower.fr.trim() || DEFAULT_THEME_CTA_BANNER.flower.fr,
      flower_ar: body.flower.ar.trim() || DEFAULT_THEME_CTA_BANNER.flower.ar,
      globe_en: body.globe.en.trim() || DEFAULT_THEME_CTA_BANNER.globe.en,
      globe_fr: body.globe.fr.trim() || DEFAULT_THEME_CTA_BANNER.globe.fr,
      globe_ar: body.globe.ar.trim() || DEFAULT_THEME_CTA_BANNER.globe.ar,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_cta_banner") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update CTA banner."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
