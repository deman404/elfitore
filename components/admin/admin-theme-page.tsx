"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Check, Clapperboard, Image as ImageIcon, Loader2, Palette, Save, Type } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchThemeHero, isValidThemeHeroText, type ThemeHeroData } from "@/lib/theme-hero"
import {
  DEFAULT_THEME_FEATURE_SECTION,
  fetchThemeFeatureSection,
  type ThemeFeatureSectionData,
} from "@/lib/theme-feature-section"
import {
  DEFAULT_THEME_TRUST_BADGES,
  fetchThemeTrustBadges,
  type ThemeTrustBadgesData,
} from "@/lib/theme-trust-badges"
import {
  DEFAULT_THEME_CTA_BANNER,
  fetchThemeCtaBanner,
  type ThemeCtaBannerData,
} from "@/lib/theme-cta-banner"

type MessageState = {
  type: "error" | "success"
  text: string
}

type ThemeFormState = ThemeHeroData
type ThemeFeatureFormState = ThemeFeatureSectionData
type ThemeTrustBadgesFormState = ThemeTrustBadgesData
type ThemeCtaFormState = ThemeCtaBannerData

const localeLabels = {
  en: "English",
  fr: "French",
  ar: "Arabic",
} as const

const locales = ["en", "fr", "ar"] as const

const featureCardLabels = ["Card 1", "Card 2", "Card 3", "Card 4"] as const

type LocaleKey = keyof ThemeHeroData["subtitle"]

export function AdminThemePage() {
  const initial = useMemo<ThemeFormState>(() => {
    return {
      mediaType: "video",
      mediaUrl: "",
      subtitle: { en: "", fr: "", ar: "" },
      title1: { en: "", fr: "", ar: "" },
      title2: { en: "", fr: "", ar: "" },
      description: { en: "", fr: "", ar: "" },
      cta: { en: "", fr: "", ar: "" },
      scroll: { en: "", fr: "", ar: "" },
    }
  }, [])

  const [form, setForm] = useState<ThemeFormState>(initial)
  const [featureForm, setFeatureForm] = useState<ThemeFeatureFormState>(DEFAULT_THEME_FEATURE_SECTION)
  const [trustForm, setTrustForm] = useState<ThemeTrustBadgesFormState>(DEFAULT_THEME_TRUST_BADGES)
  const [ctaForm, setCtaForm] = useState<ThemeCtaFormState>(DEFAULT_THEME_CTA_BANNER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingFeature, setSavingFeature] = useState(false)
  const [savingTrust, setSavingTrust] = useState(false)
  const [savingCta, setSavingCta] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [featureMessage, setFeatureMessage] = useState<MessageState | null>(null)
  const [trustMessage, setTrustMessage] = useState<MessageState | null>(null)
  const [ctaMessage, setCtaMessage] = useState<MessageState | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [hero, feature, trust, cta] = await Promise.all([
        fetchThemeHero(),
        fetchThemeFeatureSection(),
        fetchThemeTrustBadges(),
        fetchThemeCtaBanner(),
      ])
      setForm(hero)
      setFeatureForm(feature)
      setTrustForm(trust)
      setCtaForm(cta)
      setLoading(false)
    }

    void load()
  }, [])

  const updateCopy = (field: keyof Omit<ThemeHeroData, "mediaType" | "mediaUrl">, locale: keyof ThemeHeroData["subtitle"]) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value
    setForm((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [locale]: value,
      },
    }))
  }

  const updateMediaType = (mediaType: ThemeHeroData["mediaType"]) => {
    setForm((current) => ({ ...current, mediaType }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (!form.mediaUrl.trim()) {
      setMessage({ type: "error", text: "Add a hero image/video URL or path." })
      return
    }

    const requiredFields = [
      form.subtitle.en,
      form.title1.en,
      form.title2.en,
      form.description.en,
      form.cta.en,
      form.scroll.en,
    ]

    if (requiredFields.some((value) => !isValidThemeHeroText(value))) {
      setMessage({ type: "error", text: "Fill out the English text fields before saving." })
      return
    }

    setSaving(true)

    const response = await fetch("/api/admin/theme-hero", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setMessage({ type: "error", text: data.error ?? "Could not save the theme." })
    } else {
      setMessage({ type: "success", text: "Theme hero updated successfully." })
    }

    setSaving(false)
  }

  const updateFeatureText =
    (field:
      | "overlayTitle"
      | "overlayDescription"
      | "topTitle"
      | "topSubtitle"
      | "topBullet1"
      | "topBullet2"
      | "topBullet3"
      | "sectionEyebrow"
      | "sectionTitle"
      | "sectionDescription"
      | "bottomEyebrow"
      | "bottomTitle",
    locale: LocaleKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFeatureForm((current) => ({
        ...current,
        [field]: {
          ...current[field],
          [locale]: value,
        },
      }))
    }

  const updateFeatureCardText =
    (index: number, field: "title" | "description", locale: LocaleKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFeatureForm((current) => ({
        ...current,
        cards: current.cards.map((card, cardIndex) =>
          cardIndex === index
            ? {
                ...card,
                [field]: {
                  ...card[field],
                  [locale]: value,
                },
              }
            : card
        ),
      }))
    }

  const handleFeatureSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeatureMessage(null)
    setSavingFeature(true)

    const response = await fetch("/api/admin/theme-feature-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(featureForm),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setFeatureMessage({ type: "error", text: data.error ?? "Could not save the feature section." })
    } else {
      setFeatureMessage({ type: "success", text: "Feature section updated successfully." })
    }

    setSavingFeature(false)
  }

  const updateTrustBadgeText =
    (index: number, field: "title" | "description", locale: LocaleKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setTrustForm((current) => ({
        ...current,
        badges: current.badges.map((badge, badgeIndex) =>
          badgeIndex === index
            ? {
                ...badge,
                [field]: {
                  ...badge[field],
                  [locale]: value,
                },
              }
            : badge
        ),
      }))
    }

  const handleTrustSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTrustMessage(null)
    setSavingTrust(true)

    const response = await fetch("/api/admin/theme-trust-badges", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trustForm),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setTrustMessage({ type: "error", text: data.error ?? "Could not save the trust badges." })
    } else {
      setTrustMessage({ type: "success", text: "Trust badges updated successfully." })
    }

    setSavingTrust(false)
  }

  const updateCtaText =
    (field: keyof Omit<ThemeCtaFormState, "backgroundImageUrl">, locale: LocaleKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setCtaForm((current) => ({
        ...current,
        [field]: {
          ...current[field],
          [locale]: value,
        },
      }))
    }

  const handleCtaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCtaMessage(null)
    setSavingCta(true)

    const response = await fetch("/api/admin/theme-cta-banner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctaForm),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setCtaMessage({ type: "error", text: data.error ?? "Could not save the CTA banner." })
    } else {
      setCtaMessage({ type: "success", text: "CTA banner updated successfully." })
    }

    setSavingCta(false)
  }

  return (
    <AdminShell
      current="theme"
      title="Theme"
      description="Update the hero media and copy that appear on the homepage."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Homepage theme</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Control the first thing visitors see when the home page loads.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Use the tabs to edit each homepage section without scrolling through the full page.
              </p>
            </div>

            <div className="grid gap-3">
              <SettingPill label="Media" value={loading ? "Loading..." : form.mediaType} />
              <SettingPill label="Asset" value={loading ? "Loading..." : form.mediaUrl || "Not set"} />
              <SettingPill label="Scope" value="Tabbed sections" />
            </div>
          </div>
        </section>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-2 rounded-[1.25rem] bg-slate-100 p-2">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="feature">Feature Section</TabsTrigger>
            <TabsTrigger value="trust">Trust Badges</TabsTrigger>
            <TabsTrigger value="cta">CTA Banner</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Media source</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Choose whether the hero uses an image or a video, then provide a public URL or stored path.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateMediaType("image")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      form.mediaType === "image"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-80">Best for a static hero banner or photo.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMediaType("video")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      form.mediaType === "video"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Clapperboard className="h-4 w-4" />
                      Video
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-80">Best for your current looping olive video.</p>
                  </button>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Media URL or path</span>
                  <input
                    value={form.mediaUrl}
                    onChange={(event) => setForm((current) => ({ ...current, mediaUrl: event.target.value }))}
                    className="admin-input"
                    placeholder={form.mediaType === "video" ? "/video/olive.mp4" : "https://example.com/hero.jpg"}
                  />
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Preview note</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    If you store a video, make sure it is muted, loopable, and publicly reachable. Images can be any public URL or app asset path.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Type className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Localized copy</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Edit the subtitle, headline, description, CTA, and scroll label for each language.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {(["en", "fr", "ar"] as const).map((locale) => (
                  <div key={locale} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{localeLabels[locale]}</p>
                    <div className="mt-4 grid gap-4">
                      <Field label="Subtitle" value={form.subtitle[locale]} onChange={updateCopy("subtitle", locale)} />
                      <Field label="Title line 1" value={form.title1[locale]} onChange={updateCopy("title1", locale)} />
                      <Field label="Title line 2" value={form.title2[locale]} onChange={updateCopy("title2", locale)} />
                      <Field
                        label="Description"
                        value={form.description[locale]}
                        onChange={updateCopy("description", locale)}
                        textarea
                      />
                      <Field label="CTA label" value={form.cta[locale]} onChange={updateCopy("cta", locale)} />
                      <Field label="Scroll label" value={form.scroll[locale]} onChange={updateCopy("scroll", locale)} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Save className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Save theme changes</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                    Saving updates the singleton `theme_hero` row in Supabase so the homepage can read the latest hero content immediately.
                  </p>
                </div>
              </div>
              <Button type="submit" className="gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Saving..." : "Save theme"}
              </Button>
            </div>

              {message ? <Notice type={message.type} text={message.text} /> : null}
              </section>
            </form>
          </TabsContent>

          <TabsContent value="feature" className="space-y-6">
            <form onSubmit={handleFeatureSubmit} className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Feature Section</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Update the image tiles and the localized copy used in the feature section.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Left image" value={featureForm.leftImageUrl} onChange={(e) => setFeatureForm((current) => ({ ...current, leftImageUrl: e.target.value }))} />
              <Field label="Top image" value={featureForm.topImageUrl} onChange={(e) => setFeatureForm((current) => ({ ...current, topImageUrl: e.target.value }))} />
              <Field label="Bottom image" value={featureForm.bottomImageUrl} onChange={(e) => setFeatureForm((current) => ({ ...current, bottomImageUrl: e.target.value }))} />
              <Field label="Video image" value={featureForm.videoImageUrl} onChange={(e) => setFeatureForm((current) => ({ ...current, videoImageUrl: e.target.value }))} />
            </div>

            <div className="mt-6 space-y-6">
              {locales.map((locale) => (
                <div key={locale} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{localeLabels[locale]}</p>
                  <div className="mt-4 grid gap-4">
                    <Field label="Overlay title" value={featureForm.overlayTitle[locale]} onChange={updateFeatureText("overlayTitle", locale)} />
                    <Field label="Overlay description" value={featureForm.overlayDescription[locale]} onChange={updateFeatureText("overlayDescription", locale)} textarea />
                    <Field label="Top title" value={featureForm.topTitle[locale]} onChange={updateFeatureText("topTitle", locale)} />
                    <Field label="Top subtitle" value={featureForm.topSubtitle[locale]} onChange={updateFeatureText("topSubtitle", locale)} />
                    <Field label="Top bullet 1" value={featureForm.topBullet1[locale]} onChange={updateFeatureText("topBullet1", locale)} />
                    <Field label="Top bullet 2" value={featureForm.topBullet2[locale]} onChange={updateFeatureText("topBullet2", locale)} />
                    <Field label="Top bullet 3" value={featureForm.topBullet3[locale]} onChange={updateFeatureText("topBullet3", locale)} />
                    <Field label="Section eyebrow" value={featureForm.sectionEyebrow[locale]} onChange={updateFeatureText("sectionEyebrow", locale)} />
                    <Field label="Section title" value={featureForm.sectionTitle[locale]} onChange={updateFeatureText("sectionTitle", locale)} />
                    <Field label="Section description" value={featureForm.sectionDescription[locale]} onChange={updateFeatureText("sectionDescription", locale)} textarea />
                    <Field label="Bottom eyebrow" value={featureForm.bottomEyebrow[locale]} onChange={updateFeatureText("bottomEyebrow", locale)} />
                    <Field label="Bottom title" value={featureForm.bottomTitle[locale]} onChange={updateFeatureText("bottomTitle", locale)} />
                  </div>
                </div>
              ))}

              <div className="space-y-4">
                {featureForm.cards.map((card, index) => (
                  <div key={`${card.title.en}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{featureCardLabels[index]}</p>
                    <div className="mt-4 grid gap-4">
                      {locales.map((locale) => (
                        <div key={`${index}-${locale}`} className="grid gap-4 md:grid-cols-2">
                          <Field label={`${localeLabels[locale]} title`} value={card.title[locale]} onChange={updateFeatureCardText(index, "title", locale)} />
                          <Field
                            label={`${localeLabels[locale]} description`}
                            value={card.description[locale]}
                            onChange={updateFeatureCardText(index, "description", locale)}
                            textarea
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-950">Save feature section</h4>
                <p className="mt-1 text-sm text-slate-500">Stores the feature section in the `theme_feature_section` table.</p>
              </div>
              <Button type="submit" className="gap-2" disabled={savingFeature}>
                {savingFeature ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {savingFeature ? "Saving..." : "Save feature section"}
              </Button>
            </div>

            {featureMessage ? <Notice type={featureMessage.type} text={featureMessage.text} /> : null}
              </section>
            </form>
          </TabsContent>

          <TabsContent value="trust" className="space-y-6">
            <form onSubmit={handleTrustSubmit} className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Type className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Trust Badges</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Update the trust badge titles and descriptions used beneath the hero.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {trustForm.badges.map((badge, index) => (
                <div key={`${badge.title.en}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Badge {index + 1}</p>
                  <div className="mt-4 space-y-6">
                    {locales.map((locale) => (
                      <div key={`${index}-${locale}`} className="grid gap-4 md:grid-cols-2">
                        <Field label={`${localeLabels[locale]} title`} value={badge.title[locale]} onChange={updateTrustBadgeText(index, "title", locale)} />
                        <Field
                          label={`${localeLabels[locale]} description`}
                          value={badge.description[locale]}
                          onChange={updateTrustBadgeText(index, "description", locale)}
                          textarea
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-950">Save trust badges</h4>
                <p className="mt-1 text-sm text-slate-500">Stores the trust badge array in the `theme_trust_badges` table.</p>
              </div>
              <Button type="submit" className="gap-2" disabled={savingTrust}>
                {savingTrust ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {savingTrust ? "Saving..." : "Save trust badges"}
              </Button>
            </div>

            {trustMessage ? <Notice type={trustMessage.type} text={trustMessage.text} /> : null}
              </section>
            </form>
          </TabsContent>

          <TabsContent value="cta" className="space-y-6">
            <form onSubmit={handleCtaSubmit} className="space-y-6">
              <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Save className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">CTA Banner</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Edit the banner background image and the callout text near the bottom of the home page.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Background image" value={ctaForm.backgroundImageUrl} onChange={(e) => setCtaForm((current) => ({ ...current, backgroundImageUrl: e.target.value }))} />
            </div>

            <div className="mt-6 space-y-6">
              {locales.map((locale) => (
                <div key={locale} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{localeLabels[locale]}</p>
                  <div className="mt-4 grid gap-4">
                    <Field label="Title line 1" value={ctaForm.title1[locale]} onChange={updateCtaText("title1", locale)} />
                    <Field label="Title line 2" value={ctaForm.title2[locale]} onChange={updateCtaText("title2", locale)} />
                    <Field label="Leaf line" value={ctaForm.leaf[locale]} onChange={updateCtaText("leaf", locale)} />
                    <Field label="Flower line" value={ctaForm.flower[locale]} onChange={updateCtaText("flower", locale)} />
                    <Field label="Globe line" value={ctaForm.globe[locale]} onChange={updateCtaText("globe", locale)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-950">Save CTA banner</h4>
                <p className="mt-1 text-sm text-slate-500">Stores the CTA banner in the `theme_cta_banner` table.</p>
              </div>
              <Button type="submit" className="gap-2" disabled={savingCta}>
                {savingCta ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {savingCta ? "Saving..." : "Save CTA banner"}
              </Button>
            </div>

            {ctaMessage ? <Notice type={ctaMessage.type} text={ctaMessage.text} /> : null}
              </section>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  )
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  textarea?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={onChange} className="admin-input min-h-24 resize-y" />
      ) : (
        <input value={value} onChange={onChange} className="admin-input" />
      )}
    </label>
  )
}

function SettingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function Notice({ type, text }: MessageState) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {text}
    </div>
  )
}
