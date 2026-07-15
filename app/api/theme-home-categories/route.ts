import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_HOME_CATEGORIES,
  normalizeThemeHomeCategoriesData,
  type ThemeHomeCategoriesData,
} from "@/lib/theme-home-categories"

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

    return NextResponse.json(normalizeThemeHomeCategoriesData(data))
  } catch {
    return NextResponse.json(DEFAULT_THEME_HOME_CATEGORIES)
  }
}
