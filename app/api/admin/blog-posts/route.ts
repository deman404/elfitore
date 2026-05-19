import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { normalizeBlogPostRow, slugify, type BlogPostInput, type BlogPostRow } from "@/lib/blog"

export const dynamic = "force-dynamic"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeMediaType(value: unknown) {
  return value === "video" ? "video" : "image"
}

async function ensureUniqueSlug(admin: ReturnType<typeof getSupabaseAdminClient>, baseSlug: string, ignoreId?: number) {
  const cleaned = baseSlug || "post"
  let candidate = cleaned
  let counter = 2

  while (true) {
    let query = (admin.from("blog_posts") as any).select("id").eq("slug", candidate)
    if (typeof ignoreId === "number") {
      query = query.neq("id", ignoreId)
    }

    const { data, error } = await query.maybeSingle()
    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    candidate = `${cleaned}-${counter}`
    counter += 1
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before loading blog posts." }, { status: 401 })
    }

    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin
      .from("blog_posts") as any)
      .select("*")
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

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before creating a blog post." }, { status: 401 })
    }

    const body = (await request.json()) as BlogPostInput
    const title = normalizeText(body.title)
    const slugBase = slugify(normalizeText(body.slug) || title)
    const excerpt = normalizeText(body.excerpt)
    const content = normalizeText(body.content)
    const mediaUrl = normalizeText(body.mediaUrl)
    const mediaType = normalizeMediaType(body.mediaType)

    if (!title || !excerpt || !content || !mediaUrl) {
      return NextResponse.json({ error: "Fill in the title, excerpt, content, and media." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const slug = await ensureUniqueSlug(admin, slugBase)
    const payload = {
      title,
      slug,
      excerpt,
      content,
      media_type: mediaType,
      media_url: mediaUrl,
      published: Boolean(body.published),
    }

    const { data, error } = (await (admin.from("blog_posts") as any).insert(payload).select("*").single()) as {
      data: BlogPostRow | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(normalizeBlogPostRow(data as BlogPostRow))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the blog post."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating a blog post." }, { status: 401 })
    }

    const body = (await request.json()) as BlogPostInput
    if (!body.id) {
      return NextResponse.json({ error: "Missing blog post id." }, { status: 400 })
    }

    const title = normalizeText(body.title)
    const slugBase = slugify(normalizeText(body.slug) || title)
    const excerpt = normalizeText(body.excerpt)
    const content = normalizeText(body.content)
    const mediaUrl = normalizeText(body.mediaUrl)
    const mediaType = normalizeMediaType(body.mediaType)

    if (!title || !excerpt || !content || !mediaUrl) {
      return NextResponse.json({ error: "Fill in the title, excerpt, content, and media." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const slug = await ensureUniqueSlug(admin, slugBase, body.id)
    const payload = {
      title,
      slug,
      excerpt,
      content,
      media_type: mediaType,
      media_url: mediaUrl,
      published: Boolean(body.published),
    }

    const { data, error } = (await (admin.from("blog_posts") as any)
      .update(payload)
      .eq("id", body.id)
      .select("*")
      .single()) as {
      data: BlogPostRow | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(normalizeBlogPostRow(data as BlogPostRow))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the blog post."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before deleting a blog post." }, { status: 401 })
    }

    const body = (await request.json()) as { id?: number }
    if (!body.id) {
      return NextResponse.json({ error: "Missing blog post id." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { error } = await (admin.from("blog_posts") as any).delete().eq("id", body.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete the blog post."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

