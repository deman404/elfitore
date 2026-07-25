"use client"

import { useEffect, useState } from "react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { CheckCircle2, Package, Truck, MapPin, Wallet } from "lucide-react"
import { DEFAULT_THEME_SUPPORT_PAGES, fetchThemeSupportPages } from "@/lib/theme-support-pages"
import type { Locale } from "@/i18n.config"

const ICONS = [Truck, Package, CheckCircle2, MapPin, Wallet]

export default function ShippingPage() {
  const { locale, isRTL } = useLanguage()
  const [data, setData] = useState(DEFAULT_THEME_SUPPORT_PAGES.shipping)

  useEffect(() => {
    void fetchThemeSupportPages().then((pages) => setData(pages.shipping))
  }, [])

  const t = {
    title: data.title[locale as Locale],
    subtitle: data.subtitle[locale as Locale],
    bullets: data.bullets.map((bullet) => ({
      title: bullet.title[locale as Locale],
      body: bullet.body[locale as Locale],
    })),
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className={`rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Shipping policy</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.bullets.map((bullet, index) => (
                <Pill key={bullet.title} icon={ICONS[index % ICONS.length]} title={bullet.title} text={bullet.body} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function Pill({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Truck
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}