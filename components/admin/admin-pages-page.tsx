"use client"

import { useEffect, useState } from "react"
import { Eye, Loader2, Save } from "lucide-react"
import Link from "next/link"
import {
  DEFAULT_THEME_MARKETING_PAGES,
  fetchThemeMarketingPages,
  type ThemeMarketingPagesData,
} from "@/lib/theme-marketing-pages"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

type LocaleKey = "en" | "fr" | "ar"
type PageKey = "propos" | "ourStory"

const locales: LocaleKey[] = ["en", "fr", "ar"]
const pageLabels: Record<PageKey, string> = {
  propos: "À propos",
  ourStory: "Our Story",
}

export function AdminPagesPage() {
  const [data, setData] = useState<ThemeMarketingPagesData>(DEFAULT_THEME_MARKETING_PAGES)
  const [activePage, setActivePage] = useState<PageKey>("propos")
  const [locale, setLocale] = useState<LocaleKey>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const next = await fetchThemeMarketingPages()
      setData(next)
      setLoading(false)
    }

    void load()
  }, [])

  const active = data[activePage]
  const previewHref = activePage === "propos" ? "/propos" : "/our-story"

  const save = async () => {
    setSaving(true)
    setStatus("")

    const response = await fetch("/api/admin/theme-marketing-pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setStatus(response.ok ? "Pages enregistrées." : result.error ?? "Erreur de sauvegarde.")
    setSaving(false)
  }

  const updateText = (page: PageKey, field: "eyebrow" | "title" | "content" | "cta", nextLocale: LocaleKey, value: string) => {
    setData((current) => ({
      ...current,
      [page]: {
        ...current[page],
        [field]: {
          ...current[page][field],
          [nextLocale]: value,
        },
      },
    }))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1877F2]">Content</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Pages</h2>
            <p className="text-sm text-slate-500">Blog-style editing for the About and Our Story pages.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Publish
            </button>
          </div>
        </div>

        {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              {(Object.keys(pageLabels) as PageKey[]).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setActivePage(page)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activePage === page ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageLabels[page]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {locales.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocale(item)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    locale === item ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200 px-4 py-3">
            <input
              value={active.title[locale]}
              onChange={(event) => updateText(activePage, "title", locale, event.target.value)}
              placeholder="Title"
              className="w-full border-0 bg-transparent text-3xl font-medium text-slate-950 outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-2 py-2">
            <RichTextEditor
              label="Content"
              value={active.content[locale]}
              onChange={(value) => updateText(activePage, "content", locale, value)}
              className="space-y-0"
              imageUploadFolder="marketing-pages"
            />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">Post settings</p>
            <div className="mt-4 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Eyebrow</span>
                <input
                  value={active.eyebrow[locale]}
                  onChange={(event) => updateText(activePage, "eyebrow", locale, event.target.value)}
                  className="admin-input"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">CTA</span>
                <input
                  value={active.cta[locale]}
                  onChange={(event) => updateText(activePage, "cta", locale, event.target.value)}
                  className="admin-input"
                />
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Permalink: <span className="font-medium text-slate-700">{previewHref}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">Status</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>{activePage === "propos" ? "About page" : "Story page"}</p>
              <p>Locale: {locale.toUpperCase()}</p>
              <p>{saving ? "Saving..." : "Ready to publish"}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
