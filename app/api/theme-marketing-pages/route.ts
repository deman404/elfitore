import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_MARKETING_PAGES,
  type ThemeMarketingPagesData,
} from "@/lib/theme-marketing-pages"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const admin = getSupabaseAdminClient()
    const { data, error } = await (admin.from("theme_marketing_pages") as any)
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_THEME_MARKETING_PAGES)
    }

    return NextResponse.json(normalize(data as Record<string, unknown>))
  } catch {
    return NextResponse.json(DEFAULT_THEME_MARKETING_PAGES)
  }
}

function normalize(row: Record<string, unknown>): ThemeMarketingPagesData {
  return {
    propos: normalizePropos(row.propos, DEFAULT_THEME_MARKETING_PAGES.propos),
    ourStory: normalizeOurStory(row.our_story, DEFAULT_THEME_MARKETING_PAGES.ourStory),
  }
}

function normalizePropos(value: unknown, fallback: ThemeMarketingPagesData["propos"]) {
  const data = isObject(value) ? value : {}
  return {
    eyebrow: localized(data.eyebrow, fallback.eyebrow),
    title: localized(data.title, fallback.title),
    content: htmlOrDefault(data.content, fallback.content),
    heroImage: imageOrDefault(data.heroImage, fallback.heroImage),
    subtitle: localized(data.subtitle, fallback.subtitle),
    intro: localized(data.intro, fallback.intro),
    image1: imageOrDefault(data.image1, fallback.image1),
    image2: imageOrDefault(data.image2, fallback.image2),
    missionTitle: localized(data.missionTitle, fallback.missionTitle),
    missionText: localized(data.missionText, fallback.missionText),
    featureTitles: Array.isArray(data.featureTitles) && data.featureTitles.length > 0
      ? data.featureTitles.map((item: unknown, index: number) => ({
          title: localized(isObject(item) ? item.title : undefined, fallback.featureTitles[index]?.title ?? fallback.featureTitles[0].title),
        }))
      : fallback.featureTitles,
    cta: localized(data.cta, fallback.cta),
  }
}

function normalizeOurStory(value: unknown, fallback: ThemeMarketingPagesData["ourStory"]) {
  const data = isObject(value) ? value : {}
  return {
    eyebrow: localized(data.eyebrow, fallback.eyebrow),
    title: localized(data.title, fallback.title),
    content: htmlOrDefault(data.content, fallback.content),
    heroImage: imageOrDefault(data.heroImage, fallback.heroImage),
    subtitle: localized(data.subtitle, fallback.subtitle),
    timelineTitle: localized(data.timelineTitle, fallback.timelineTitle),
    steps: Array.isArray(data.steps) && data.steps.length > 0
      ? data.steps.map((item: unknown, index: number) => ({
          title: localized(isObject(item) ? item.title : undefined, fallback.steps[index]?.title ?? fallback.steps[0].title),
          body: localized(isObject(item) ? item.body : undefined, fallback.steps[index]?.body ?? fallback.steps[0].body),
        }))
      : fallback.steps,
    stepImage1: imageOrDefault(data.stepImage1, fallback.stepImage1),
    stepImage2: imageOrDefault(data.stepImage2, fallback.stepImage2),
    stepImage3: imageOrDefault(data.stepImage3, fallback.stepImage3),
    stepImage4: imageOrDefault(data.stepImage4, fallback.stepImage4),
    bottomTitle: localized(data.bottomTitle, fallback.bottomTitle),
    bottomText: localized(data.bottomText, fallback.bottomText),
    cta: localized(data.cta, fallback.cta),
  }
}

function localized(value: unknown, fallback: Record<"en" | "fr" | "ar", string>) {
  const object = isObject(value) ? value : {}
  return {
    en: stringOrDefault(object.en, fallback.en),
    fr: stringOrDefault(object.fr, fallback.fr),
    ar: stringOrDefault(object.ar, fallback.ar),
  }
}

function htmlOrDefault(value: unknown, fallback: Record<"en" | "fr" | "ar", string>) {
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

function imageOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
