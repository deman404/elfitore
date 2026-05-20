"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent, ReactNode } from "react"
import { Loader2, Save } from "lucide-react"
import { fetchThemeMarketingPages, DEFAULT_THEME_MARKETING_PAGES, type ThemeMarketingPagesData } from "@/lib/theme-marketing-pages"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

export function AdminPagesPage() {
  const [data, setData] = useState<ThemeMarketingPagesData>(DEFAULT_THEME_MARKETING_PAGES)
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

  const handleChange =
    (section: "propos" | "ourStory", field: string, locale: "en" | "fr" | "ar") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setData((current) => {
        const next = structuredClone(current)
        ;(next[section] as Record<string, any>)[field][locale] = value
        return next
      })
    }

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

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1877F2]">Contenu</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Pages</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Cette page gère uniquement les deux pages éditables du site: À propos et Notre histoire.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        </div>

        {status ? (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {status}
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <PageEditor
          title="À propos"
          subtitle="Les champs visibles sur la page À propos."
          loading={loading}
          renderFields={(locale) => (
            <div className="space-y-3">
              <Field label="Eyebrow" value={data.propos.eyebrow[locale]} onChange={handleChange("propos", "eyebrow", locale)} />
              <Field label="Titre" value={data.propos.title[locale]} onChange={handleChange("propos", "title", locale)} textarea />
              <RichTextEditor
                label="Sous-titre"
                value={data.propos.subtitle[locale]}
                onChange={(value) =>
                  setData((current) => {
                    const next = structuredClone(current)
                    next.propos.subtitle[locale] = value
                    return next
                  })
                }
              />
              <RichTextEditor
                label="Introduction"
                value={data.propos.intro[locale]}
                onChange={(value) =>
                  setData((current) => {
                    const next = structuredClone(current)
                    next.propos.intro[locale] = value
                    return next
                  })
                }
              />
              <Field label="Titre mission" value={data.propos.missionTitle[locale]} onChange={handleChange("propos", "missionTitle", locale)} />
              <RichTextEditor
                label="Texte mission"
                value={data.propos.missionText[locale]}
                onChange={(value) =>
                  setData((current) => {
                    const next = structuredClone(current)
                    next.propos.missionText[locale] = value
                    return next
                  })
                }
              />
              <Field label="Bouton CTA" value={data.propos.cta[locale]} onChange={handleChange("propos", "cta", locale)} />
            </div>
          )}
          extra={
            <div className="grid gap-3">
              {data.propos.featureTitles.map((feature, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Carte {index + 1}</p>
                  <div className="mt-3 space-y-3">
                    <Field
                      label="Titre EN"
                      value={feature.title.en}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.propos.featureTitles[index].title.en = event.target.value
                        return next
                      })}
                    />
                    <Field
                      label="Titre FR"
                      value={feature.title.fr}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.propos.featureTitles[index].title.fr = event.target.value
                        return next
                      })}
                    />
                    <Field
                      label="Titre AR"
                      value={feature.title.ar}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.propos.featureTitles[index].title.ar = event.target.value
                        return next
                      })}
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />

        <PageEditor
          title="Notre histoire"
          subtitle="Les champs visibles sur la page Notre histoire."
          loading={loading}
          renderFields={(locale) => (
            <div className="space-y-3">
              <Field label="Eyebrow" value={data.ourStory.eyebrow[locale]} onChange={handleChange("ourStory", "eyebrow", locale)} />
              <Field label="Titre" value={data.ourStory.title[locale]} onChange={handleChange("ourStory", "title", locale)} textarea />
              <RichTextEditor
                label="Sous-titre"
                value={data.ourStory.subtitle[locale]}
                onChange={(value) =>
                  setData((current) => {
                    const next = structuredClone(current)
                    next.ourStory.subtitle[locale] = value
                    return next
                  })
                }
              />
              <Field label="Titre section" value={data.ourStory.timelineTitle[locale]} onChange={handleChange("ourStory", "timelineTitle", locale)} />
              <Field label="Titre bas" value={data.ourStory.bottomTitle[locale]} onChange={handleChange("ourStory", "bottomTitle", locale)} />
              <RichTextEditor
                label="Texte bas"
                value={data.ourStory.bottomText[locale]}
                onChange={(value) =>
                  setData((current) => {
                    const next = structuredClone(current)
                    next.ourStory.bottomText[locale] = value
                    return next
                  })
                }
              />
              <Field label="Bouton CTA" value={data.ourStory.cta[locale]} onChange={handleChange("ourStory", "cta", locale)} />
            </div>
          )}
          extra={
            <div className="grid gap-3">
              {data.ourStory.steps.map((step, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Étape {index + 1}</p>
                  <div className="mt-3 space-y-3">
                    <Field
                      label="Titre EN"
                      value={step.title.en}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.ourStory.steps[index].title.en = event.target.value
                        return next
                      })}
                    />
                    <Field
                      label="Titre FR"
                      value={step.title.fr}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.ourStory.steps[index].title.fr = event.target.value
                        return next
                      })}
                    />
                    <Field
                      label="Titre AR"
                      value={step.title.ar}
                      onChange={(event) => setData((current) => {
                        const next = structuredClone(current)
                        next.ourStory.steps[index].title.ar = event.target.value
                        return next
                      })}
                    />
                    <RichTextEditor
                      label="Texte EN"
                      value={step.body.en}
                      onChange={(value) =>
                        setData((current) => {
                          const next = structuredClone(current)
                          next.ourStory.steps[index].body.en = value
                          return next
                        })
                      }
                    />
                    <RichTextEditor
                      label="Texte FR"
                      value={step.body.fr}
                      onChange={(value) =>
                        setData((current) => {
                          const next = structuredClone(current)
                          next.ourStory.steps[index].body.fr = value
                          return next
                        })
                      }
                    />
                    <RichTextEditor
                      label="Texte AR"
                      value={step.body.ar}
                      onChange={(value) =>
                        setData((current) => {
                          const next = structuredClone(current)
                          next.ourStory.steps[index].body.ar = value
                          return next
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </div>
  )
}

function PageEditor({
  title,
  subtitle,
  loading,
  renderFields,
  extra,
}: {
  title: string
  subtitle: string
  loading: boolean
  renderFields: (locale: "en" | "fr" | "ar") => ReactNode
  extra: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div>
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Chargement...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {(["en", "fr", "ar"] as const).map((locale) => (
            <div key={locale} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{locale}</p>
              <div className="mt-3">{renderFields(locale)}</div>
            </div>
          ))}
          <div>{extra}</div>
        </div>
      )}
    </section>
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
  const className = "admin-input"
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={onChange} className={`${className} min-h-20 resize-y`} />
      ) : (
        <input value={value} onChange={onChange} className={className} />
      )}
    </label>
  )
}
