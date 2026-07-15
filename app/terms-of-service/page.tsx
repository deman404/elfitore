"use client"

import { useEffect, useState } from "react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { ClipboardList, PackageCheck, AlertTriangle, Scale } from "lucide-react"
import { DEFAULT_THEME_SUPPORT_PAGES, fetchThemeSupportPages } from "@/lib/theme-support-pages"
import type { Locale } from "@/i18n.config"

export default function TermsOfServicePage() {
  const { locale, isRTL } = useLanguage()
  const [data, setData] = useState(DEFAULT_THEME_SUPPORT_PAGES.termsOfService)

  useEffect(() => {
    void fetchThemeSupportPages().then((pages) => setData(pages.termsOfService))
  }, [])

  const t = {
    title: data.title[locale as Locale],
    subtitle: data.subtitle[locale as Locale],
    sections: data.sections.map((section) => ({
      title: section.title[locale as Locale],
      body: section.body[locale as Locale],
    })),
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className={`rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Legal</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {t.sections.map((section, index) => (
                <article key={section.title} className="rounded-2xl border border-border/60 bg-background p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <TermsIcon index={index} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function TermsIcon({ index }: { index: number }) {
  const icons = [ClipboardList, PackageCheck, Scale, AlertTriangle] as const
  const Icon = icons[index] ?? ClipboardList
  return <Icon className="h-4 w-4" />
}
