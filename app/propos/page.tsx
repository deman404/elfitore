"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { DEFAULT_THEME_MARKETING_PAGES, fetchThemeMarketingPages } from "@/lib/theme-marketing-pages"
import type { Locale } from "@/i18n.config"

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
        <div className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 ${isRTL ? "text-right" : "text-left"}`}>
          <article>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{t.eyebrow[lang]}</p>
            <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">{t.title[lang]}</h1>
            <div
              className="rich-text-content mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg"
              dangerouslySetInnerHTML={{ __html: t.content[lang] }}
            />

            <div className="mt-12 border-t border-border/60 pt-8">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {t.cta[lang]}
              </Link>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
