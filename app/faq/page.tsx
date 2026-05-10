"use client"

import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "FAQ",
    subtitle: "Quick answers to the most common questions about orders, payment, and delivery.",
  },
  fr: {
    title: "FAQ",
    subtitle: "Réponses rapides aux questions les plus fréquentes sur les commandes, le paiement et la livraison.",
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "إجابات سريعة على أكثر الأسئلة شيوعًا حول الطلبات والدفع والتوصيل.",
  },
} as const

const faqItems = {
  en: [
    { q: "How do I place an order?", a: "Add products to your cart, choose checkout or WhatsApp, then complete your contact details and delivery choice." },
    { q: "Can I pay on delivery?", a: "Yes. Cash on delivery is available for supported delivery areas." },
    { q: "Do you ship across Morocco?", a: "We ship to the Moroccan cities and zones listed in the delivery settings, and admins can add more destinations anytime." },
    { q: "How long does delivery take?", a: "Delivery time depends on the city and carrier. Your order will show the shipping price during checkout." },
    { q: "Can I change my order after placing it?", a: "Contact us as soon as possible on WhatsApp so we can help update the order before it is processed." },
  ],
  fr: [
    { q: "Comment passer une commande ?", a: "Ajoutez les produits au panier, choisissez le paiement ou WhatsApp, puis complétez vos coordonnées et la livraison." },
    { q: "Puis-je payer à la livraison ?", a: "Oui. Le paiement à la livraison est disponible pour les zones compatibles." },
    { q: "Livrez-vous partout au Maroc ?", a: "Nous livrons dans les villes et zones définies dans les paramètres de livraison, et l’admin peut en ajouter d’autres à tout moment." },
    { q: "Combien de temps prend la livraison ?", a: "Le délai dépend de la ville et du transporteur. Le prix de livraison apparaît au paiement." },
    { q: "Puis-je modifier ma commande après l’avoir passée ?", a: "Contactez-nous au plus vite sur WhatsApp afin que nous puissions vous aider avant le traitement." },
  ],
  ar: [
    { q: "كيف أقدم طلبًا؟", a: "أضف المنتجات إلى السلة، ثم اختر الدفع أو واتس آب وأكمل بياناتك وخيار التوصيل." },
    { q: "هل يمكنني الدفع عند الاستلام؟", a: "نعم، الدفع عند الاستلام متاح للمناطق المدعومة." },
    { q: "هل تشحنون داخل المغرب؟", a: "نحن نشحن إلى المدن والمناطق المحددة في إعدادات التوصيل، ويمكن للمشرف إضافة وجهات جديدة في أي وقت." },
    { q: "كم يستغرق التوصيل؟", a: "يعتمد الوقت على المدينة وشركة الشحن. يظهر سعر الشحن عند إتمام الطلب." },
    { q: "هل يمكنني تعديل الطلب بعد إرساله؟", a: "تواصل معنا بسرعة عبر واتس آب وسنحاول تحديث الطلب قبل معالجته." },
  ],
} as const

export default function FaqPage() {
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]
  const items = faqItems[locale as Locale]

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
