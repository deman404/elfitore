"use client"

import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { RotateCcw, ShieldCheck, TimerReset } from "lucide-react"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "Returns",
    subtitle: "How returns and issue handling work for online orders.",
    points: [
      "Contact us quickly if a product arrives damaged or incorrect.",
      "We will review the issue and guide you through the next step.",
      "Returns are handled case by case depending on the product and condition.",
      "Please keep the original packaging when possible so we can review it properly.",
    ],
  },
  fr: {
    title: "Retours",
    subtitle: "Comment fonctionnent les retours et la gestion des problèmes pour les commandes en ligne.",
    points: [
      "Contactez-nous rapidement si un produit arrive endommagé ou incorrect.",
      "Nous examinerons le problème et vous guiderons pour la suite.",
      "Les retours sont traités au cas par cas selon le produit et son état.",
      "Conservez si possible l’emballage d’origine pour que nous puissions l’examiner correctement.",
    ],
  },
  ar: {
    title: "المرتجعات",
    subtitle: "كيفية التعامل مع المرتجعات والمشاكل في الطلبات عبر الإنترنت.",
    points: [
      "تواصل معنا بسرعة إذا وصل المنتج تالفًا أو غير صحيح.",
      "سنراجع المشكلة ونرشدك إلى الخطوة التالية.",
      "تُعالج المرتجعات حالةً بحالة حسب المنتج والحالة.",
      "يرجى الاحتفاظ بالتغليف الأصلي قدر الإمكان لنتمكن من مراجعته بشكل صحيح.",
    ],
  },
} as const

export default function ReturnsPage() {
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className={`rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Returns policy</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <Feature icon={ShieldCheck} title="Case review" text={t.points[1]} />
              <Feature icon={RotateCcw} title="Returns" text={t.points[2]} />
              <Feature icon={TimerReset} title="Keep packaging" text={t.points[3]} />
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-border/60 bg-background p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-foreground">What to do first</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {t.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck
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
