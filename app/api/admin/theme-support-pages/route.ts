import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_SUPPORT_PAGES,
  type LocalizedText,
  type ThemeSupportPagesData,
} from "@/lib/theme-support-pages"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the pages." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeSupportPagesData
    const payload = {
      id: 1,
      contact: normalizeSimple(body.contact, DEFAULT_THEME_SUPPORT_PAGES.contact),
      faq: normalizeFaq(body.faq),
      shipping: normalizeList(body.shipping, DEFAULT_THEME_SUPPORT_PAGES.shipping, body.shipping.bullets, DEFAULT_THEME_SUPPORT_PAGES.shipping.bullets, "bullets"),
      returns: normalizeList(body.returns, DEFAULT_THEME_SUPPORT_PAGES.returns, body.returns.points, DEFAULT_THEME_SUPPORT_PAGES.returns.points, "points"),
      privacy_policy: normalizeLegal(body.privacyPolicy, DEFAULT_THEME_SUPPORT_PAGES.privacyPolicy),
      terms_of_service: normalizeLegal(body.termsOfService, DEFAULT_THEME_SUPPORT_PAGES.termsOfService),
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_support_pages") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the pages."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function normalizeSimple(
  input: ThemeSupportPagesData["contact"],
  fallback: ThemeSupportPagesData["contact"]
) {
  return {
    title: normalizeLocalized(input.title, fallback.title),
    subtitle: normalizeLocalized(input.subtitle, fallback.subtitle),
    intro: normalizeLocalized(input.intro, fallback.intro),
  }
}

function normalizeFaq(input: ThemeSupportPagesData["faq"]) {
  const fallback = DEFAULT_THEME_SUPPORT_PAGES.faq
  return {
    title: normalizeLocalized(input.title, fallback.title),
    subtitle: normalizeLocalized(input.subtitle, fallback.subtitle),
    items: (input.items ?? []).map((item, index) => ({
      q: normalizeLocalized(item.q, fallback.items[index]?.q ?? fallback.items[0].q),
      a: normalizeLocalized(item.a, fallback.items[index]?.a ?? fallback.items[0].a),
    })),
  }
}

function normalizeList(
  input: { title: LocalizedText; subtitle: LocalizedText },
  fallback: { title: LocalizedText; subtitle: LocalizedText },
  inputList: LocalizedText[] | undefined,
  fallbackList: LocalizedText[],
  listKey: string
) {
  const list = (inputList ?? []).map((item, index) =>
    normalizeLocalized(item, fallbackList[index] ?? fallbackList[0])
  )

  return {
    title: normalizeLocalized(input.title, fallback.title),
    subtitle: normalizeLocalized(input.subtitle, fallback.subtitle),
    [listKey]: list,
  }
}

function normalizeLegal(input: ThemeSupportPagesData["privacyPolicy"], fallback: ThemeSupportPagesData["privacyPolicy"]) {
  return {
    title: normalizeLocalized(input.title, fallback.title),
    subtitle: normalizeLocalized(input.subtitle, fallback.subtitle),
    sections: (input.sections ?? []).map((section, index) => ({
      title: normalizeLocalized(section.title, fallback.sections[index]?.title ?? fallback.sections[0].title),
      body: normalizeLocalized(section.body, fallback.sections[index]?.body ?? fallback.sections[0].body),
    })),
  }
}

function normalizeLocalized(value: LocalizedText, fallback: LocalizedText) {
  return {
    en: value?.en?.trim() || fallback.en,
    fr: value?.fr?.trim() || fallback.fr,
    ar: value?.ar?.trim() || fallback.ar,
  }
}
