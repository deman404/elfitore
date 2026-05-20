"use client"

import Link from "next/link"
import { Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { DEFAULT_THEME_MARKETING_PAGES, fetchThemeMarketingPages } from "@/lib/theme-marketing-pages"
import type { Locale } from "@/i18n.config"
import { useEffect, useState } from "react"

export default function ProposPage() {
  const { locale, isRTL } = useLanguage()
  const [t, setT] = useState(DEFAULT_THEME_MARKETING_PAGES.propos)
  const lang = locale as Locale

  useEffect(() => {
    const load = async () => {
      const data = await fetchThemeMarketingPages()
      setT(data.propos)
    }

    void load()
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <section className={`rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{t.eyebrow[lang]}</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title[lang]}</h1>
              <div
                className="rich-text-content max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg"
                dangerouslySetInnerHTML={{ __html: t.subtitle[lang] }}
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div
                  className="rich-text-content text-base leading-7 text-muted-foreground sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: t.intro[lang] }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FeatureCard icon={Leaf} title={t.featureTitles[0]?.title[lang] ?? ""} />
                  <FeatureCard icon={ShieldCheck} title={t.featureTitles[1]?.title[lang] ?? ""} />
                  <FeatureCard icon={Sparkles} title={t.featureTitles[2]?.title[lang] ?? ""} />
                  <FeatureCard icon={Truck} title={t.featureTitles[3]?.title[lang] ?? ""} />
                </div>
              </div>

              <aside className="rounded-[1.75rem] border border-border/60 bg-background p-5 sm:p-6">
                <h2 className="font-serif text-2xl text-foreground">{t.missionTitle[lang]}</h2>
                <div
                  className="mt-3 rich-text-content text-sm leading-7 text-muted-foreground sm:text-base"
                  dangerouslySetInnerHTML={{ __html: t.missionText[lang] }}
                />

                <ul className="mt-6 space-y-3">
                  {t.featureTitles.map((item) => (
                    <li key={item.title.en} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span>{item.title[lang]}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/shop"
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    {t.cta[lang]}
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
}: {
  icon: typeof Leaf
  title: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <p className="font-medium text-foreground">{title}</p>
      </div>
    </div>
  )
}
