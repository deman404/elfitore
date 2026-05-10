import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_HERO, type ThemeHeroData } from "@/lib/theme-hero"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_hero") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_HERO)
    }

    return NextResponse.json(normalizeThemeHero(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_HERO)
  }
}

function normalizeThemeHero(row: Record<string, unknown>): ThemeHeroData {
  return {
    mediaType: row.media_type === "image" ? "image" : "video",
    mediaUrl: typeof row.media_url === "string" && row.media_url.trim() ? row.media_url : DEFAULT_THEME_HERO.mediaUrl,
    subtitle: {
      en: stringOrDefault(row.subtitle_en, DEFAULT_THEME_HERO.subtitle.en),
      fr: stringOrDefault(row.subtitle_fr, DEFAULT_THEME_HERO.subtitle.fr),
      ar: stringOrDefault(row.subtitle_ar, DEFAULT_THEME_HERO.subtitle.ar),
    },
    title1: {
      en: stringOrDefault(row.title1_en, DEFAULT_THEME_HERO.title1.en),
      fr: stringOrDefault(row.title1_fr, DEFAULT_THEME_HERO.title1.fr),
      ar: stringOrDefault(row.title1_ar, DEFAULT_THEME_HERO.title1.ar),
    },
    title2: {
      en: stringOrDefault(row.title2_en, DEFAULT_THEME_HERO.title2.en),
      fr: stringOrDefault(row.title2_fr, DEFAULT_THEME_HERO.title2.fr),
      ar: stringOrDefault(row.title2_ar, DEFAULT_THEME_HERO.title2.ar),
    },
    description: {
      en: stringOrDefault(row.description_en, DEFAULT_THEME_HERO.description.en),
      fr: stringOrDefault(row.description_fr, DEFAULT_THEME_HERO.description.fr),
      ar: stringOrDefault(row.description_ar, DEFAULT_THEME_HERO.description.ar),
    },
    cta: {
      en: stringOrDefault(row.cta_en, DEFAULT_THEME_HERO.cta.en),
      fr: stringOrDefault(row.cta_fr, DEFAULT_THEME_HERO.cta.fr),
      ar: stringOrDefault(row.cta_ar, DEFAULT_THEME_HERO.cta.ar),
    },
    scroll: {
      en: stringOrDefault(row.scroll_en, DEFAULT_THEME_HERO.scroll.en),
      fr: stringOrDefault(row.scroll_fr, DEFAULT_THEME_HERO.scroll.fr),
      ar: stringOrDefault(row.scroll_ar, DEFAULT_THEME_HERO.scroll.ar),
    },
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}
