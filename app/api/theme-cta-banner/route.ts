import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_CTA_BANNER, type ThemeCtaBannerData } from "@/lib/theme-cta-banner"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_cta_banner") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_CTA_BANNER)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_CTA_BANNER)
  }
}

function normalize(row: Record<string, unknown>): ThemeCtaBannerData {
  return {
    backgroundImageUrl: stringOrDefault(row.background_image_url, DEFAULT_THEME_CTA_BANNER.backgroundImageUrl),
    title1: localized(row, "title1", DEFAULT_THEME_CTA_BANNER.title1),
    title2: localized(row, "title2", DEFAULT_THEME_CTA_BANNER.title2),
    leaf: localized(row, "leaf", DEFAULT_THEME_CTA_BANNER.leaf),
    flower: localized(row, "flower", DEFAULT_THEME_CTA_BANNER.flower),
    globe: localized(row, "globe", DEFAULT_THEME_CTA_BANNER.globe),
  }
}

function localized(row: Record<string, unknown>, prefix: string, fallback: Record<"en" | "fr" | "ar", string>) {
  return {
    en: stringOrDefault(row[`${prefix}_en`], fallback.en),
    fr: stringOrDefault(row[`${prefix}_fr`], fallback.fr),
    ar: stringOrDefault(row[`${prefix}_ar`], fallback.ar),
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}
