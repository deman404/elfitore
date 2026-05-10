import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_TRUST_BADGES, type ThemeTrustBadgesData } from "@/lib/theme-trust-badges"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating trust badges." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeTrustBadgesData
    const payload = {
      id: 1,
      badges: body.badges.length ? body.badges : DEFAULT_THEME_TRUST_BADGES.badges,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_trust_badges") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update trust badges."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
