import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  DEFAULT_THEME_MARKETING_PAGES,
  type ThemeMarketingPagesData,
} from "@/lib/theme-marketing-pages"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the pages." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeMarketingPagesData
    const payload = {
      id: 1,
      propos: normalizePropos(body.propos),
      our_story: normalizeOurStory(body.ourStory),
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_marketing_pages") as any).upsert(payload, { onConflict: "id" })) as {
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

function normalizePropos(input: ThemeMarketingPagesData["propos"]) {
  return {
    eyebrow: normalizeLocalized(input.eyebrow, DEFAULT_THEME_MARKETING_PAGES.propos.eyebrow),
    title: normalizeLocalized(input.title, DEFAULT_THEME_MARKETING_PAGES.propos.title),
    content: normalizeLocalized(input.content, DEFAULT_THEME_MARKETING_PAGES.propos.content),
    heroImage: normalizeImage(input.heroImage, DEFAULT_THEME_MARKETING_PAGES.propos.heroImage),
    subtitle: normalizeLocalized(input.subtitle, DEFAULT_THEME_MARKETING_PAGES.propos.subtitle),
    intro: normalizeLocalized(input.intro, DEFAULT_THEME_MARKETING_PAGES.propos.intro),
    image1: normalizeImage(input.image1, DEFAULT_THEME_MARKETING_PAGES.propos.image1),
    image2: normalizeImage(input.image2, DEFAULT_THEME_MARKETING_PAGES.propos.image2),
    missionTitle: normalizeLocalized(input.missionTitle, DEFAULT_THEME_MARKETING_PAGES.propos.missionTitle),
    missionText: normalizeLocalized(input.missionText, DEFAULT_THEME_MARKETING_PAGES.propos.missionText),
    featureTitles: input.featureTitles.map((item, index) => ({
      title: normalizeLocalized(item.title, DEFAULT_THEME_MARKETING_PAGES.propos.featureTitles[index]?.title ?? DEFAULT_THEME_MARKETING_PAGES.propos.featureTitles[0].title),
    })),
    cta: normalizeLocalized(input.cta, DEFAULT_THEME_MARKETING_PAGES.propos.cta),
  }
}

function normalizeOurStory(input: ThemeMarketingPagesData["ourStory"]) {
  return {
    eyebrow: normalizeLocalized(input.eyebrow, DEFAULT_THEME_MARKETING_PAGES.ourStory.eyebrow),
    title: normalizeLocalized(input.title, DEFAULT_THEME_MARKETING_PAGES.ourStory.title),
    content: normalizeLocalized(input.content, DEFAULT_THEME_MARKETING_PAGES.ourStory.content),
    heroImage: normalizeImage(input.heroImage, DEFAULT_THEME_MARKETING_PAGES.ourStory.heroImage),
    subtitle: normalizeLocalized(input.subtitle, DEFAULT_THEME_MARKETING_PAGES.ourStory.subtitle),
    timelineTitle: normalizeLocalized(input.timelineTitle, DEFAULT_THEME_MARKETING_PAGES.ourStory.timelineTitle),
    steps: input.steps.map((step, index) => ({
      title: normalizeLocalized(step.title, DEFAULT_THEME_MARKETING_PAGES.ourStory.steps[index]?.title ?? DEFAULT_THEME_MARKETING_PAGES.ourStory.steps[0].title),
      body: normalizeLocalized(step.body, DEFAULT_THEME_MARKETING_PAGES.ourStory.steps[index]?.body ?? DEFAULT_THEME_MARKETING_PAGES.ourStory.steps[0].body),
    })),
    stepImage1: normalizeImage(input.stepImage1, DEFAULT_THEME_MARKETING_PAGES.ourStory.stepImage1),
    stepImage2: normalizeImage(input.stepImage2, DEFAULT_THEME_MARKETING_PAGES.ourStory.stepImage2),
    stepImage3: normalizeImage(input.stepImage3, DEFAULT_THEME_MARKETING_PAGES.ourStory.stepImage3),
    stepImage4: normalizeImage(input.stepImage4, DEFAULT_THEME_MARKETING_PAGES.ourStory.stepImage4),
    bottomTitle: normalizeLocalized(input.bottomTitle, DEFAULT_THEME_MARKETING_PAGES.ourStory.bottomTitle),
    bottomText: normalizeLocalized(input.bottomText, DEFAULT_THEME_MARKETING_PAGES.ourStory.bottomText),
    cta: normalizeLocalized(input.cta, DEFAULT_THEME_MARKETING_PAGES.ourStory.cta),
  }
}

function normalizeLocalized(
  value: Record<"en" | "fr" | "ar", string>,
  fallback: Record<"en" | "fr" | "ar", string>
) {
  return {
    en: plainTextOrDefault(value.en, fallback.en),
    fr: plainTextOrDefault(value.fr, fallback.fr),
    ar: plainTextOrDefault(value.ar, fallback.ar),
  }
}

function normalizeImage(value: string, fallback: string) {
  return value?.trim() || fallback
}

function plainTextOrDefault(value: string, fallback: string) {
  const plain = htmlToPlainText(value)
  return plain || fallback
}

function htmlToPlainText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
}
