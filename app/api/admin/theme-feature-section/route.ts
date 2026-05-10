import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { DEFAULT_THEME_FEATURE_SECTION, type ThemeFeatureSectionData } from "@/lib/theme-feature-section"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before updating the feature section." }, { status: 401 })
    }

    const body = (await request.json()) as ThemeFeatureSectionData
    const payload = {
      id: 1,
      left_image_url: body.leftImageUrl.trim() || DEFAULT_THEME_FEATURE_SECTION.leftImageUrl,
      top_image_url: body.topImageUrl.trim() || DEFAULT_THEME_FEATURE_SECTION.topImageUrl,
      bottom_image_url: body.bottomImageUrl.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomImageUrl,
      video_image_url: body.videoImageUrl.trim() || DEFAULT_THEME_FEATURE_SECTION.videoImageUrl,
      overlay_title_en: body.overlayTitle.en.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayTitle.en,
      overlay_title_fr: body.overlayTitle.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayTitle.fr,
      overlay_title_ar: body.overlayTitle.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayTitle.ar,
      overlay_description_en: body.overlayDescription.en.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayDescription.en,
      overlay_description_fr: body.overlayDescription.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayDescription.fr,
      overlay_description_ar: body.overlayDescription.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.overlayDescription.ar,
      top_title_en: body.topTitle.en.trim() || DEFAULT_THEME_FEATURE_SECTION.topTitle.en,
      top_title_fr: body.topTitle.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.topTitle.fr,
      top_title_ar: body.topTitle.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.topTitle.ar,
      top_subtitle_en: body.topSubtitle.en.trim() || DEFAULT_THEME_FEATURE_SECTION.topSubtitle.en,
      top_subtitle_fr: body.topSubtitle.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.topSubtitle.fr,
      top_subtitle_ar: body.topSubtitle.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.topSubtitle.ar,
      top_bullet1_en: body.topBullet1.en.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet1.en,
      top_bullet1_fr: body.topBullet1.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet1.fr,
      top_bullet1_ar: body.topBullet1.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet1.ar,
      top_bullet2_en: body.topBullet2.en.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet2.en,
      top_bullet2_fr: body.topBullet2.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet2.fr,
      top_bullet2_ar: body.topBullet2.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet2.ar,
      top_bullet3_en: body.topBullet3.en.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet3.en,
      top_bullet3_fr: body.topBullet3.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet3.fr,
      top_bullet3_ar: body.topBullet3.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.topBullet3.ar,
      section_eyebrow_en: body.sectionEyebrow.en.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionEyebrow.en,
      section_eyebrow_fr: body.sectionEyebrow.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionEyebrow.fr,
      section_eyebrow_ar: body.sectionEyebrow.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionEyebrow.ar,
      section_title_en: body.sectionTitle.en.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionTitle.en,
      section_title_fr: body.sectionTitle.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionTitle.fr,
      section_title_ar: body.sectionTitle.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionTitle.ar,
      section_description_en: body.sectionDescription.en.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionDescription.en,
      section_description_fr: body.sectionDescription.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionDescription.fr,
      section_description_ar: body.sectionDescription.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.sectionDescription.ar,
      bottom_eyebrow_en: body.bottomEyebrow.en.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomEyebrow.en,
      bottom_eyebrow_fr: body.bottomEyebrow.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomEyebrow.fr,
      bottom_eyebrow_ar: body.bottomEyebrow.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomEyebrow.ar,
      bottom_title_en: body.bottomTitle.en.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomTitle.en,
      bottom_title_fr: body.bottomTitle.fr.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomTitle.fr,
      bottom_title_ar: body.bottomTitle.ar.trim() || DEFAULT_THEME_FEATURE_SECTION.bottomTitle.ar,
      cards: body.cards,
    }

    const admin = getSupabaseAdminClient()
    const { error } = (await (admin.from("theme_feature_section") as any).upsert(payload, { onConflict: "id" })) as {
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the feature section."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
