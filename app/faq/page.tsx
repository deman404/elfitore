"use client"

import { useEffect, useState } from "react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/components/language-context"
import { DEFAULT_THEME_SUPPORT_PAGES, fetchThemeSupportPages } from "@/lib/theme-support-pages"
import type { Locale } from "@/i18n.config"

export default function FaqPage() {
  const { locale, isRTL } = useLanguage()
  const [data, setData] = useState(DEFAULT_THEME_SUPPORT_PAGES.faq)

  useEffect(() => {
    void fetchThemeSupportPages().then((pages) => setData(pages.faq))
  }, [])

  const t = { title: data.title[locale as Locale], subtitle: data.subtitle[locale as Locale] }
  const items = data.items.map((item) => ({ q: item.q[locale as Locale], a: item.a[locale as Locale] }))

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <section className={`space-y-6 rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Help Center</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {items.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="rounded-2xl border border-border/60 px-4">
                  <AccordionTrigger className="py-4 text-left text-base font-medium text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-7 text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
