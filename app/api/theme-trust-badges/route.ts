import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_TRUST_BADGES, type ThemeTrustBadgesData } from "@/lib/theme-trust-badges"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_trust_badges") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_TRUST_BADGES)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_TRUST_BADGES)
  }
}

function normalize(row: Record<string, unknown>): ThemeTrustBadgesData {
  const badges = Array.isArray(row.badges) ? row.badges : DEFAULT_THEME_TRUST_BADGES.badges

  return {
    badges: badges.map((item: any, index: number) => ({
      title: {
        en: item?.title?.en ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.title.en ?? "",
        fr: item?.title?.fr ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.title.fr ?? "",
        ar: item?.title?.ar ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.title.ar ?? "",
      },
      description: {
        en: item?.description?.en ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.description.en ?? "",
        fr: item?.description?.fr ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.description.fr ?? "",
        ar: item?.description?.ar ?? DEFAULT_THEME_TRUST_BADGES.badges[index]?.description.ar ?? "",
      },
    })),
  }
}
