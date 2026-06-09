import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_FOOTER, normalizeThemeFooterData, type ThemeFooterData } from "@/lib/theme-footer"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_footer") as any).select("*").eq("id", 1).maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_FOOTER)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_FOOTER)
  }
}

function normalize(row: Record<string, unknown>): ThemeFooterData {
  return normalizeThemeFooterData(row.content)
}
