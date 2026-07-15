"use client"

import { useEffect, useState } from "react"
import { Eye, Loader2, Plus, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  DEFAULT_THEME_SUPPORT_PAGES,
  fetchThemeSupportPages,
  type LocalizedText,
  type ThemeSupportPagesData,
} from "@/lib/theme-support-pages"

type LocaleKey = "en" | "fr" | "ar"
type PageKey = "contact" | "faq" | "shipping" | "returns" | "privacyPolicy" | "termsOfService"

const locales: LocaleKey[] = ["en", "fr", "ar"]

const pageLabels: Record<PageKey, string> = {
  contact: "Contact",
  faq: "FAQ",
  shipping: "Shipping",
  returns: "Returns",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
}

const previewHrefs: Record<PageKey, string> = {
  contact: "/contact",
  faq: "/faq",
  shipping: "/shipping",
  returns: "/returns",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
}

function emptyLocalized(): LocalizedText {
  return { en: "", fr: "", ar: "" }
}

export function AdminSupportPagesPage() {
  const [data, setData] = useState<ThemeSupportPagesData>(DEFAULT_THEME_SUPPORT_PAGES)
  const [activePage, setActivePage] = useState<PageKey>("contact")
  const [locale, setLocale] = useState<LocaleKey>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const next = await fetchThemeSupportPages()
      setData(next)
      setLoading(false)
    }

    void load()
  }, [])

  const save = async () => {
    setSaving(true)
    setStatus("")

    const response = await fetch("/api/admin/theme-support-pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const result = (await response.json().catch(() => ({}))) as { error?: string }
    setStatus(response.ok ? "Pages enregistrées." : result.error ?? "Erreur de sauvegarde.")
    setSaving(false)
  }

  const updateField = (page: PageKey, field: string, value: string) => {
    setData((current) => ({
      ...current,
      [page]: {
        ...current[page],
        [field]: {
          ...(current[page] as any)[field],
          [locale]: value,
        },
      },
    }))
  }

  const updateListItem = (page: PageKey, listKey: string, index: number, field: string, value: string) => {
    setData((current) => {
      const list = [...((current[page] as any)[listKey] as any[])]
      list[index] = {
        ...list[index],
        [field]: {
          ...list[index][field],
          [locale]: value,
        },
      }
      return {
        ...current,
        [page]: {
          ...current[page],
          [listKey]: list,
        },
      }
    })
  }

  const addFaqItem = () => {
    setData((current) => ({
      ...current,
      faq: {
        ...current.faq,
        items: [...current.faq.items, { q: emptyLocalized(), a: emptyLocalized() }],
      },
    }))
  }

  const removeFaqItem = (index: number) => {
    setData((current) => ({
      ...current,
      faq: {
        ...current.faq,
        items: current.faq.items.filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1877F2]">Content</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Support pages</h2>
            <p className="text-sm text-slate-500">Edit Contact, FAQ, Shipping, Returns, Privacy Policy, and Terms of Service.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={previewHrefs[activePage]}
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

      <section className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
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

        <div className="space-y-6 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Title</span>
              <input
                value={(data[activePage] as any).title[locale]}
                onChange={(event) => updateField(activePage, "title", event.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Subtitle</span>
              <input
                value={(data[activePage] as any).subtitle[locale]}
                onChange={(event) => updateField(activePage, "subtitle", event.target.value)}
                className="admin-input"
              />
            </label>
          </div>

          {activePage === "contact" ? (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Intro</span>
              <textarea
                value={data.contact.intro[locale]}
                onChange={(event) => updateField("contact", "intro", event.target.value)}
                rows={3}
                className="admin-input"
              />
            </label>
          ) : null}

          {activePage === "faq" ? (
            <div className="space-y-4">
              {data.faq.items.map((item, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Question {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(index)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-600">Question</span>
                    <input
                      value={item.q[locale]}
                      onChange={(event) => updateListItem("faq", "items", index, "q", event.target.value)}
                      className="admin-input"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-600">Answer</span>
                    <textarea
                      value={item.a[locale]}
                      onChange={(event) => updateListItem("faq", "items", index, "a", event.target.value)}
                      rows={2}
                      className="admin-input"
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Add question
              </button>
            </div>
          ) : null}

          {activePage === "shipping" ? (
            <div className="space-y-3">
              {data.shipping.bullets.map((bullet, index) => (
                <label key={index} className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">Point {index + 1}</span>
                  <textarea
                    value={bullet[locale]}
                    rows={2}
                    className="admin-input"
                    onChange={(event) => {
                      const value = event.target.value
                      setData((current) => {
                        const bullets = [...current.shipping.bullets]
                        bullets[index] = { ...bullets[index], [locale]: value }
                        return { ...current, shipping: { ...current.shipping, bullets } }
                      })
                    }}
                  />
                </label>
              ))}
            </div>
          ) : null}

          {activePage === "returns" ? (
            <div className="space-y-3">
              {data.returns.points.map((point, index) => (
                <label key={index} className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">Point {index + 1}</span>
                  <textarea
                    value={point[locale]}
                    rows={2}
                    className="admin-input"
                    onChange={(event) => {
                      const value = event.target.value
                      setData((current) => {
                        const points = [...current.returns.points]
                        points[index] = { ...points[index], [locale]: value }
                        return { ...current, returns: { ...current.returns, points } }
                      })
                    }}
                  />
                </label>
              ))}
            </div>
          ) : null}

          {activePage === "privacyPolicy" || activePage === "termsOfService" ? (
            <div className="space-y-4">
              {(data[activePage] as ThemeSupportPagesData["privacyPolicy"]).sections.map((section, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Section {index + 1}</p>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-600">Title</span>
                    <input
                      value={section.title[locale]}
                      onChange={(event) => {
                        const value = event.target.value
                        setData((current) => {
                          const sections = [...(current[activePage] as ThemeSupportPagesData["privacyPolicy"]).sections]
                          sections[index] = { ...sections[index], title: { ...sections[index].title, [locale]: value } }
                          return { ...current, [activePage]: { ...(current[activePage] as any), sections } }
                        })
                      }}
                      className="admin-input"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-600">Body</span>
                    <textarea
                      value={section.body[locale]}
                      rows={3}
                      className="admin-input"
                      onChange={(event) => {
                        const value = event.target.value
                        setData((current) => {
                          const sections = [...(current[activePage] as ThemeSupportPagesData["privacyPolicy"]).sections]
                          sections[index] = { ...sections[index], body: { ...sections[index].body, [locale]: value } }
                          return { ...current, [activePage]: { ...(current[activePage] as any), sections } }
                        })
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
