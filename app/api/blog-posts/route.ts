import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { normalizeBlogPostRow, type BlogPostRow } from "@/lib/blog"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin
      .from("blog_posts") as any)
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(((data ?? []) as BlogPostRow[]).map(normalizeBlogPostRow))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load blog posts."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

