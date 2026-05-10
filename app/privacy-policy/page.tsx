"use client"

import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { useLanguage } from "@/components/language-context"
import { ShieldCheck, Lock, Eye, Database } from "lucide-react"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your information.",
    sections: [
      {
        title: "Information we collect",
        body: "We may collect details you submit through checkout, WhatsApp orders, contact forms, and admin-managed delivery settings.",
      },
      {
        title: "How we use information",
        body: "We use your information to process orders, contact you about delivery, improve the storefront experience, and maintain admin records.",
      },
      {
        title: "Sharing and security",
        body: "We do not sell personal data. Access is limited to authorized staff, and we take reasonable steps to protect stored information.",
      },
      {
        title: "Your choices",
        body: "You can contact us to review or update order details where applicable, and you may choose not to submit optional information.",
      },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    subtitle: "Comment nous collectons, utilisons et protégeons vos informations.",
    sections: [
      {
        title: "Informations collectées",
        body: "Nous pouvons collecter les informations que vous soumettez via le paiement, les commandes WhatsApp, les formulaires de contact et les paramètres de livraison gérés par l’admin.",
      },
      {
        title: "Utilisation des informations",
        body: "Nous utilisons vos informations pour traiter les commandes, vous contacter au sujet de la livraison, améliorer la boutique et conserver les enregistrements administratifs.",
      },
      {
        title: "Partage et sécurité",
        body: "Nous ne vendons pas les données personnelles. L’accès est limité au personnel autorisé et nous prenons des mesures raisonnables pour protéger les informations stockées.",
      },
      {
        title: "Vos choix",
        body: "Vous pouvez nous contacter pour consulter ou mettre à jour les détails de commande lorsque cela est possible, et vous pouvez choisir de ne pas fournir les informations facultatives.",
      },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    subtitle: "كيف نجمع معلوماتك ونستخدمها ونحميها.",
    sections: [
      {
        title: "المعلومات التي نجمعها",
        body: "قد نجمع التفاصيل التي ترسلها عبر الدفع وطلبات واتس آب ونماذج التواصل وإعدادات التوصيل التي يديرها المشرف.",
      },
      {
        title: "كيف نستخدم المعلومات",
        body: "نستخدم معلوماتك لمعالجة الطلبات والتواصل معك بخصوص التوصيل وتحسين تجربة المتجر والحفاظ على السجلات الإدارية.",
      },
      {
        title: "المشاركة والأمان",
        body: "نحن لا نبيع البيانات الشخصية. يقتصر الوصول على الموظفين المخولين، ونتخذ خطوات معقولة لحماية المعلومات المخزنة.",
      },
      {
        title: "خياراتك",
        body: "يمكنك التواصل معنا لمراجعة أو تحديث تفاصيل الطلب حيثما ينطبق ذلك، ويمكنك اختيار عدم إرسال المعلومات الاختيارية.",
      },
    ],
  },
} as const

export default function PrivacyPolicyPage() {
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
                      <LegalIcon index={index} />
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

function LegalIcon({ index }: { index: number }) {
  const icons = [ShieldCheck, Eye, Lock, Database] as const
  const Icon = icons[index] ?? ShieldCheck
  return <Icon className="h-4 w-4" />
}
