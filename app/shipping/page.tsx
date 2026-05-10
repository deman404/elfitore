"use client"

import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { CheckCircle2, Package, Truck } from "lucide-react"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "Shipping",
    subtitle: "Delivery pricing, areas, and how shipping works on El Fitore.",
    bullets: [
      "Shipping rates are set by city and delivery company in the admin panel.",
      "Checkout shows the shipping price before you place the order.",
      "Admins can add or update delivery methods and city prices anytime.",
      "Orders placed by WhatsApp or COD are still saved in the admin orders list.",
    ],
  },
  fr: {
    title: "Livraison",
    subtitle: "Prix de livraison, zones desservies et fonctionnement de la livraison sur El Fitore.",
    bullets: [
      "Les tarifs sont définis par ville et par transporteur dans le panneau d’administration.",
      "Le paiement affiche le prix de livraison avant validation de la commande.",
      "Les admins peuvent ajouter ou modifier les méthodes de livraison et les prix à tout moment.",
      "Les commandes passées par WhatsApp ou contre remboursement sont aussi enregistrées dans l’administration.",
    ],
  },
  ar: {
    title: "التوصيل",
    subtitle: "أسعار التوصيل والمناطق وكيفية عمل الشحن في El Fitore.",
    bullets: [
      "يتم تحديد أسعار الشحن حسب المدينة وشركة التوصيل من لوحة الإدارة.",
      "يعرض الدفع سعر الشحن قبل إتمام الطلب.",
      "يمكن للمشرف إضافة أو تعديل طرق التوصيل وأسعار المدن في أي وقت.",
      "الطلبات عبر واتس آب أو الدفع عند الاستلام تُحفظ أيضًا في لوحة الإدارة.",
    ],
  },
} as const

export default function ShippingPage() {
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]

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

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <Pill icon={Truck} title="Delivery pricing" text={t.bullets[0]} />
              <Pill icon={Package} title="Checkout" text={t.bullets[1]} />
              <Pill icon={CheckCircle2} title="Admin tracking" text={t.bullets[3]} />
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-border/60 bg-background p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-foreground">How it works</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {t.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{bullet}</span>
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
