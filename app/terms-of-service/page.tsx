"use client"

import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { ClipboardList, PackageCheck, AlertTriangle, Scale } from "lucide-react"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "Terms of Service",
    subtitle: "The basic rules for using our site and placing orders.",
    sections: [
      {
        title: "Using the site",
        body: "Please use the website lawfully and do not attempt to disrupt, scrape, or misuse the service or its content.",
      },
      {
        title: "Orders and availability",
        body: "Orders are accepted subject to product availability, delivery area coverage, and confirmation of order details.",
      },
      {
        title: "Pricing and delivery",
        body: "Prices, shipping rates, and delivery options may change. The checkout page shows the current total before you submit an order.",
      },
      {
        title: "Limitations and contact",
        body: "We do our best to provide accurate information, but errors can happen. Contact us if you need help resolving an issue.",
      },
    ],
  },
  fr: {
    title: "Conditions d’utilisation",
    subtitle: "Les règles de base pour utiliser notre site et passer commande.",
    sections: [
      {
        title: "Utilisation du site",
        body: "Veuillez utiliser le site de manière légale et ne pas tenter de perturber, copier ou détourner le service ou son contenu.",
      },
      {
        title: "Commandes et disponibilité",
        body: "Les commandes sont acceptées sous réserve de disponibilité des produits, de la zone de livraison et de la confirmation des détails.",
      },
      {
        title: "Prix et livraison",
        body: "Les prix, tarifs de livraison et options peuvent changer. La page de paiement affiche le total actuel avant validation.",
      },
      {
        title: "Limites et contact",
        body: "Nous faisons de notre mieux pour fournir des informations exactes, mais des erreurs peuvent survenir. Contactez-nous en cas de besoin.",
      },
    ],
  },
  ar: {
    title: "شروط الخدمة",
    subtitle: "القواعد الأساسية لاستخدام الموقع وإرسال الطلبات.",
    sections: [
      {
        title: "استخدام الموقع",
        body: "يرجى استخدام الموقع بشكل قانوني وعدم محاولة تعطيل الخدمة أو نسخها أو إساءة استخدامها أو إساءة استخدام محتواها.",
      },
      {
        title: "الطلبات والتوفر",
        body: "تُقبل الطلبات حسب توفر المنتجات وتغطية منطقة التوصيل وتأكيد تفاصيل الطلب.",
      },
      {
        title: "الأسعار والتوصيل",
        body: "قد تتغير الأسعار ورسوم الشحن وخيارات التوصيل. تعرض صفحة الدفع الإجمالي الحالي قبل إرسال الطلب.",
      },
      {
        title: "القيود والتواصل",
        body: "نبذل قصارى جهدنا لتقديم معلومات دقيقة، لكن قد تحدث أخطاء. تواصل معنا إذا كنت بحاجة إلى المساعدة.",
      },
    ],
  },
} as const

export default function TermsOfServicePage() {
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]

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
