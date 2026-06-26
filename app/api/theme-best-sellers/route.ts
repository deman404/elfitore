import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_BEST_SELLERS, type ThemeBestSellersData } from "@/lib/theme-best-sellers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_best_sellers") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_BEST_SELLERS)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_BEST_SELLERS)
  }
}

function normalize(row: Record<string, unknown>): ThemeBestSellersData {
  const productIds = Array.isArray(row.product_ids) ? row.product_ids : DEFAULT_THEME_BEST_SELLERS.productIds

  return {
    productIds: productIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0),
  }
}
