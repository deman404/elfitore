import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_HERO,
  normalizeThemeHeroMediaType,
  normalizeThemeHeroUrl,
  type ThemeHeroData,
} from "@/lib/theme-hero"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the theme." }, { status: 401 })
    }

    const body = (await request.json()) as Partial<ThemeHeroData>
    const mediaType = normalizeThemeHeroMediaType(body.mediaType)
    const mediaUrl = normalizeThemeHeroUrl(body.mediaUrl)

    if (!mediaUrl) {
      return NextResponse.json({ error: "Provide a media URL or path for the hero section." }, { status: 400 })
    }

    const payload = {
      id: 1,
      media_type: mediaType,
      media_url: mediaUrl,
      subtitle_en: body.subtitle?.en?.trim() || DEFAULT_THEME_HERO.subtitle.en,
      subtitle_fr: body.subtitle?.fr?.trim() || DEFAULT_THEME_HERO.subtitle.fr,
      subtitle_ar: body.subtitle?.ar?.trim() || DEFAULT_THEME_HERO.subtitle.ar,
      title1_en: body.title1?.en?.trim() || DEFAULT_THEME_HERO.title1.en,
      title1_fr: body.title1?.fr?.trim() || DEFAULT_THEME_HERO.title1.fr,
      title1_ar: body.title1?.ar?.trim() || DEFAULT_THEME_HERO.title1.ar,
      title2_en: body.title2?.en?.trim() || DEFAULT_THEME_HERO.title2.en,
      title2_fr: body.title2?.fr?.trim() || DEFAULT_THEME_HERO.title2.fr,
      title2_ar: body.title2?.ar?.trim() || DEFAULT_THEME_HERO.title2.ar,
      description_en: body.description?.en?.trim() || DEFAULT_THEME_HERO.description.en,
      description_fr: body.description?.fr?.trim() || DEFAULT_THEME_HERO.description.fr,
      description_ar: body.description?.ar?.trim() || DEFAULT_THEME_HERO.description.ar,
      cta_en: body.cta?.en?.trim() || DEFAULT_THEME_HERO.cta.en,
      cta_fr: body.cta?.fr?.trim() || DEFAULT_THEME_HERO.cta.fr,
      cta_ar: body.cta?.ar?.trim() || DEFAULT_THEME_HERO.cta.ar,
      scroll_en: body.scroll?.en?.trim() || DEFAULT_THEME_HERO.scroll.en,
      scroll_fr: body.scroll?.fr?.trim() || DEFAULT_THEME_HERO.scroll.fr,
      scroll_ar: body.scroll?.ar?.trim() || DEFAULT_THEME_HERO.scroll.ar,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_hero") as any).upsert(payload, {
      onConflict: "id",
    })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update theme."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
