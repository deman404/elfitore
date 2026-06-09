import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_FOOTER,
  normalizeThemeFooterInput,
  type ThemeFooterData,
} from "@/lib/theme-footer"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the footer." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeFooterData
    const payload = {
      id: 1,
      content: normalizeThemeFooterInput(body || DEFAULT_THEME_FOOTER),
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_footer") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the footer."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
