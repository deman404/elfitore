import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_HOME_CATEGORIES, type ThemeHomeCategoriesData } from "@/lib/theme-home-categories"

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
    const cards = incomingCards.length
      ? incomingCards.map((card, index) => ({
          title: {
            en: card.title?.en?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.en || "",
            fr: card.title?.fr?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.fr || "",
            ar: card.title?.ar?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.title.ar || "",
          },
          description: {
            en: card.description?.en?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.en || "",
            fr: card.description?.fr?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.fr || "",
            ar: card.description?.ar?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.description.ar || "",
          },
          imageUrl: card.imageUrl?.trim() || DEFAULT_THEME_HOME_CATEGORIES.cards[index]?.imageUrl || "",
        }))
      : DEFAULT_THEME_HOME_CATEGORIES.cards

    const payload = {
      id: 1,
      cards,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_home_categories") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update home categories."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
