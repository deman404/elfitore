import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_SUPPORT_PAGES,
  type LocalizedText,
  type ThemeSupportPagesData,
} from "@/lib/theme-support-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_support_pages") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_SUPPORT_PAGES)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_SUPPORT_PAGES)
  }
}

function normalize(row: Record<string, unknown>): ThemeSupportPagesData {
  return {
    contact: normalizeSimple(row.contact, DEFAULT_THEME_SUPPORT_PAGES.contact, ["intro"]),
    faq: normalizeFaq(row.faq),
    shipping: normalizeList(row.shipping, DEFAULT_THEME_SUPPORT_PAGES.shipping, DEFAULT_THEME_SUPPORT_PAGES.shipping.bullets, "bullets") as ThemeSupportPagesData["shipping"],
    returns: normalizeList(row.returns, DEFAULT_THEME_SUPPORT_PAGES.returns, DEFAULT_THEME_SUPPORT_PAGES.returns.points, "points") as ThemeSupportPagesData["returns"],
    privacyPolicy: normalizeLegal(row.privacy_policy, DEFAULT_THEME_SUPPORT_PAGES.privacyPolicy),
    termsOfService: normalizeLegal(row.terms_of_service, DEFAULT_THEME_SUPPORT_PAGES.termsOfService),
  }
}

function normalizeSimple(
  value: unknown,
  fallback: { title: LocalizedText; subtitle: LocalizedText; intro: LocalizedText },
  _extraKeys: string[]
) {
  const data = isObject(value) ? value : {}
  return {
    title: localized(data.title, fallback.title),
    subtitle: localized(data.subtitle, fallback.subtitle),
    intro: localized(data.intro, fallback.intro),
  }
}

function normalizeFaq(value: unknown) {
  const fallback = DEFAULT_THEME_SUPPORT_PAGES.faq
  const data = isObject(value) ? value : {}
  return {
    title: localized(data.title, fallback.title),
    subtitle: localized(data.subtitle, fallback.subtitle),
    items:
      Array.isArray(data.items) && data.items.length > 0
        ? data.items.map((item: unknown, index: number) => ({
            q: localized(isObject(item) ? item.q : undefined, fallback.items[index]?.q ?? fallback.items[0].q),
            a: localized(isObject(item) ? item.a : undefined, fallback.items[index]?.a ?? fallback.items[0].a),
          }))
        : fallback.items,
  }
}

function normalizeList(
  value: unknown,
  fallback: { title: LocalizedText; subtitle: LocalizedText },
  fallbackList: LocalizedText[],
  listKey: string
) {
  const data = isObject(value) ? value : {}
  const rawList = data[listKey]
  const list =
    Array.isArray(rawList) && rawList.length > 0
      ? rawList.map((item: unknown, index: number) => localized(item, fallbackList[index] ?? fallbackList[0]))
      : fallbackList

  return {
    title: localized(data.title, fallback.title),
    subtitle: localized(data.subtitle, fallback.subtitle),
    [listKey]: list,
  }
}

function normalizeLegal(value: unknown, fallback: { title: LocalizedText; subtitle: LocalizedText; sections: { title: LocalizedText; body: LocalizedText }[] }) {
  const data = isObject(value) ? value : {}
  return {
    title: localized(data.title, fallback.title),
    subtitle: localized(data.subtitle, fallback.subtitle),
    sections:
      Array.isArray(data.sections) && data.sections.length > 0
        ? data.sections.map((item: unknown, index: number) => ({
            title: localized(isObject(item) ? item.title : undefined, fallback.sections[index]?.title ?? fallback.sections[0].title),
            body: localized(isObject(item) ? item.body : undefined, fallback.sections[index]?.body ?? fallback.sections[0].body),
          }))
        : fallback.sections,
  }
}

function localized(value: unknown, fallback: LocalizedText) {
  const object = isObject(value) ? value : {}
  return {
    en: stringOrDefault(object.en, fallback.en),
    fr: stringOrDefault(object.fr, fallback.fr),
    ar: stringOrDefault(object.ar, fallback.ar),
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
