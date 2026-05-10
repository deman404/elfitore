import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_FEATURE_SECTION, type ThemeFeatureSectionData } from "@/lib/theme-feature-section"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_feature_section") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_FEATURE_SECTION)
    }

    return NextResponse.json(normalizeFeatureSection(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_FEATURE_SECTION)
  }
}

function normalizeFeatureSection(row: Record<string, unknown>): ThemeFeatureSectionData {
  const cards = Array.isArray(row.cards) ? row.cards : DEFAULT_THEME_FEATURE_SECTION.cards

  return {
    leftImageUrl: stringOrDefault(row.left_image_url, DEFAULT_THEME_FEATURE_SECTION.leftImageUrl),
    topImageUrl: stringOrDefault(row.top_image_url, DEFAULT_THEME_FEATURE_SECTION.topImageUrl),
    bottomImageUrl: stringOrDefault(row.bottom_image_url, DEFAULT_THEME_FEATURE_SECTION.bottomImageUrl),
    videoImageUrl: stringOrDefault(row.video_image_url, DEFAULT_THEME_FEATURE_SECTION.videoImageUrl),
    overlayTitle: localized(row, "overlay_title", DEFAULT_THEME_FEATURE_SECTION.overlayTitle),
    overlayDescription: localized(row, "overlay_description", DEFAULT_THEME_FEATURE_SECTION.overlayDescription),
    topTitle: localized(row, "top_title", DEFAULT_THEME_FEATURE_SECTION.topTitle),
    topSubtitle: localized(row, "top_subtitle", DEFAULT_THEME_FEATURE_SECTION.topSubtitle),
    topBullet1: localized(row, "top_bullet1", DEFAULT_THEME_FEATURE_SECTION.topBullet1),
    topBullet2: localized(row, "top_bullet2", DEFAULT_THEME_FEATURE_SECTION.topBullet2),
    topBullet3: localized(row, "top_bullet3", DEFAULT_THEME_FEATURE_SECTION.topBullet3),
    sectionEyebrow: localized(row, "section_eyebrow", DEFAULT_THEME_FEATURE_SECTION.sectionEyebrow),
    sectionTitle: localized(row, "section_title", DEFAULT_THEME_FEATURE_SECTION.sectionTitle),
    sectionDescription: localized(row, "section_description", DEFAULT_THEME_FEATURE_SECTION.sectionDescription),
    bottomEyebrow: localized(row, "bottom_eyebrow", DEFAULT_THEME_FEATURE_SECTION.bottomEyebrow),
    bottomTitle: localized(row, "bottom_title", DEFAULT_THEME_FEATURE_SECTION.bottomTitle),
    cards: cards.map((item: any, index: number) => ({
      title: {
        en: item?.title?.en ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.title.en ?? "",
        fr: item?.title?.fr ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.title.fr ?? "",
        ar: item?.title?.ar ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.title.ar ?? "",
      },
      description: {
        en: item?.description?.en ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.description.en ?? "",
        fr: item?.description?.fr ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.description.fr ?? "",
        ar: item?.description?.ar ?? DEFAULT_THEME_FEATURE_SECTION.cards[index]?.description.ar ?? "",
      },
    })),
  }
}

function localized(
  row: Record<string, unknown>,
  prefix: string,
  fallback: Record<"en" | "fr" | "ar", string>
) {
  return {
    en: stringOrDefault(row[`${prefix}_en`], fallback.en),
    fr: stringOrDefault(row[`${prefix}_fr`], fallback.fr),
    ar: stringOrDefault(row[`${prefix}_ar`], fallback.ar),
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}
