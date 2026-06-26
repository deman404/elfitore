import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_BEST_SELLERS, type ThemeBestSellersData } from "@/lib/theme-best-sellers"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating best sellers." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeBestSellersData
    const productIds = Array.isArray(body.productIds)
      ? body.productIds
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
          .slice(0, 4)
      : DEFAULT_THEME_BEST_SELLERS.productIds

    const payload = {
      id: 1,
      product_ids: productIds,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_best_sellers") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update best sellers."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
