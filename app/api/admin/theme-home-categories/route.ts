import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_HOME_CATEGORIES,
  normalizeThemeHomeCategoriesData,
  validateThemeHomeCategoryCards,
  type ThemeHomeCategoriesData,
} from "@/lib/theme-home-categories"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating home categories." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeHomeCategoriesData
    const incomingCards = Array.isArray(body.cards) ? body.cards : []
    const cards = incomingCards.length ? normalizeThemeHomeCategoriesData({ cards: incomingCards }).cards : DEFAULT_THEME_HOME_CATEGORIES.cards

    const payload = {
      id: 1,
      cards,
    }

    const admin = getSupabaseAdminClient()
    const { data: categoryRows } = await (admin.from("product_categories") as any).select("id")
    const warnings = validateThemeHomeCategoryCards(
      incomingCards as Array<Record<string, unknown>>,
      (categoryRows ?? []).map((row: { id: number }) => row.id)
    )
    const { error } = (await (admin.from("theme_home_categories") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ...payload, warnings })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update home categories."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}