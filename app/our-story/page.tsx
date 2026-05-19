"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Heart, MapPinned, Sparkles } from "lucide-react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { DEFAULT_THEME_MARKETING_PAGES, fetchThemeMarketingPages } from "@/lib/theme-marketing-pages"
import type { Locale } from "@/i18n.config"

export default function OurStoryPage() {
  const { locale, isRTL } = useLanguage()
  const [t, setT] = useState(DEFAULT_THEME_MARKETING_PAGES.ourStory)
  const lang = locale as Locale

  useEffect(() => {
    const load = async () => {
      const data = await fetchThemeMarketingPages()
      setT(data.ourStory)
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
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle[lang]}</p>
            </div>

            <div className="mt-10">
              <h2 className="font-serif text-2xl text-foreground">{t.timelineTitle[lang]}</h2>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {t.steps.map((step, index) => (
                <article key={step.title.en} className="rounded-2xl border border-border/60 bg-background p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <StepIcon index={index} />
                  </div>
                  <h2 className="font-serif text-xl text-foreground">{step.title[lang]}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body[lang]}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-border/60 bg-background p-5 sm:p-6">
                <h2 className="font-serif text-2xl text-foreground">{t.bottomTitle[lang]}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.bottomText[lang]}</p>
              </div>
              <div className="rounded-[1.75rem] border border-border/60 bg-primary/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {locale === "fr" ? "Toujours en évolution" : locale === "ar" ? "يتطور باستمرار" : "Always evolving"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {locale === "fr"
                        ? "Nous affinons notre collection et notre expérience."
                        : locale === "ar"
                          ? "نواصل تحسين مجموعتنا وتجربتنا."
                          : "We keep refining our collection and experience."}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm text-foreground">
                  <MapPinned className="h-4 w-4 text-primary" />
                  <span>{locale === "fr" ? "Inspiré au Maroc" : locale === "ar" ? "مستوحى من المغرب" : "Inspired in Morocco"}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>{locale === "fr" ? "Pensé avec soin" : locale === "ar" ? "مصمم بعناية" : "Built with care"}</span>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{locale === "fr" ? "Conçu pour durer" : locale === "ar" ? "صُمم ليستمر" : "Designed to last"}</span>
                </div>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {t.cta[lang]}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function StepIcon({ index }: { index: number }) {
  const icons = [BadgeCheck, MapPinned, Heart, Sparkles] as const
  const Icon = icons[index] ?? BadgeCheck
  return <Icon className="h-4 w-4" />
}
