import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { normalizeBlogPostRow, type BlogPostRow } from "@/lib/blog"

export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin
      .from("blog_posts") as any)
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Not found." }, { status: 404 })
    }

    return NextResponse.json(normalizeBlogPostRow(data as BlogPostRow))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the blog post."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

