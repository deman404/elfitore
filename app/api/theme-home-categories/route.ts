import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_HOME_CATEGORIES, type ThemeHomeCategoriesData } from "@/lib/theme-home-categories"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_home_categories") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_HOME_CATEGORIES)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_HOME_CATEGORIES)
  }
}

function normalize(row: Record<string, unknown>): ThemeHomeCategoriesData {
  const cards = Array.isArray(row.cards) ? row.cards : DEFAULT_THEME_HOME_CATEGORIES.cards

  return {
    cards: cards.map((item: any, index: number) => ({
      title: {
        en: stringOrDefault(item?.title?.en, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.en ?? ""),
        fr: stringOrDefault(item?.title?.fr, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.fr ?? ""),
        ar: stringOrDefault(item?.title?.ar, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.ar ?? ""),
      },
      description: {
        en: stringOrDefault(item?.description?.en, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.en ?? ""),
        fr: stringOrDefault(item?.description?.fr, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.fr ?? ""),
        ar: stringOrDefault(item?.description?.ar, DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.ar ?? ""),
      },
      imageUrl: typeof item?.imageUrl === "string" && item.imageUrl.trim()
        ? item.imageUrl
        : DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.imageUrl ?? "",
      categorySlug: typeof item?.categorySlug === "string" && item.categorySlug.trim()
        ? item.categorySlug
        : DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.categorySlug ?? "",
    })),
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}
