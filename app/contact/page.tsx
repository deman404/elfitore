"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Footer } from "@/components/boty/footer"
import { Header } from "@/components/boty/header"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import {
  DEFAULT_CONTACT_ADDRESS,
  DEFAULT_CONTACT_GOOGLE_MAPS_URL,
  DEFAULT_CONTACT_PHONE,
  DEFAULT_CONTACT_WHATSAPP_NUMBER,
  buildGoogleMapsLink,
  fetchSiteSettings,
  formatPhoneNumberForLink,
  formatWhatsAppNumberForLink,
} from "@/lib/site-settings"
import { DEFAULT_THEME_SUPPORT_PAGES, fetchThemeSupportPages } from "@/lib/theme-support-pages"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    whatsapp: "WhatsApp",
    callUs: "Call us",
    visitUs: "Visit us",
    formTitle: "Send a message",
    name: "Your name",
    email: "Email address",
    subject: "Subject",
    message: "Message",
    send: "Send via WhatsApp",
    support: "Customer support",
    reply: "We usually reply as soon as possible during business hours.",
  },
  fr: {
    whatsapp: "WhatsApp",
    callUs: "Téléphone",
    visitUs: "Adresse",
    formTitle: "Envoyer un message",
    name: "Votre nom",
    email: "Adresse e-mail",
    subject: "Objet",
    message: "Message",
    send: "Envoyer via WhatsApp",
    support: "Support client",
    reply: "Nous répondons généralement dès que possible pendant les heures ouvrables.",
  },
  ar: {
    whatsapp: "واتس آب",
    callUs: "اتصال",
    visitUs: "زيارة",
    formTitle: "أرسل رسالة",
    name: "اسمك",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    send: "إرسال عبر واتس آب",
    support: "دعم العملاء",
    reply: "نرد عادة في أسرع وقت ممكن خلال ساعات العمل.",
  },
} as const

export default function ContactPage() {
  const { locale, isRTL } = useLanguage()
  const staticText = translations[locale as Locale]
  const [content, setContent] = useState(DEFAULT_THEME_SUPPORT_PAGES.contact)
  const t = {
    ...staticText,
    title: content.title[locale as Locale],
    subtitle: content.subtitle[locale as Locale],
    intro: content.intro[locale as Locale],
  }
  const [whatsappLink, setWhatsappLink] = useState(`https://wa.me/${DEFAULT_CONTACT_WHATSAPP_NUMBER}`)
  const [phoneLink, setPhoneLink] = useState(`tel:${formatPhoneNumberForLink(DEFAULT_CONTACT_PHONE)}`)
  const [contactAddress, setContactAddress] = useState(DEFAULT_CONTACT_ADDRESS)
  const [mapsLink, setMapsLink] = useState(DEFAULT_CONTACT_GOOGLE_MAPS_URL)
  const [displayPhone, setDisplayPhone] = useState(DEFAULT_CONTACT_PHONE)

  useEffect(() => {
    void fetchThemeSupportPages().then((pages) => setContent(pages.contact))
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      const whatsappDigits = formatWhatsAppNumberForLink(settings.whatsappNumber || DEFAULT_CONTACT_WHATSAPP_NUMBER)
      const phoneValue = settings.contactPhone || DEFAULT_CONTACT_PHONE
      const addressValue = settings.contactAddress || DEFAULT_CONTACT_ADDRESS

      setWhatsappLink(`https://wa.me/${whatsappDigits || DEFAULT_CONTACT_WHATSAPP_NUMBER}`)
      setPhoneLink(`tel:${formatPhoneNumberForLink(phoneValue)}`)
      setContactAddress(addressValue)
      setMapsLink(buildGoogleMapsLink(settings.contactGoogleMapsUrl || DEFAULT_CONTACT_GOOGLE_MAPS_URL, addressValue))
      setDisplayPhone(phoneValue)
    }

    void loadSettings()
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <div className={`grid gap-8 lg:grid-cols-[1fr_0.9fr] ${isRTL ? "text-right" : "text-left"}`}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{t.support}</p>
                  <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InfoCard icon={MessageCircle} title={t.whatsapp} description="Fast replies for orders and delivery questions" />
                  <InfoCard icon={Phone} title={t.callUs} description={displayPhone} href={phoneLink} />
                  <InfoCard icon={MapPin} title={t.visitUs} description={contactAddress} href={mapsLink} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <a href={whatsappLink} target="_blank" rel="noreferrer">{t.send}</a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/faq">FAQ</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-background p-5 sm:p-6">
                <h2 className="font-serif text-2xl text-foreground">{t.formTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.reply}</p>

                <form className="mt-6 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <input className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder={t.name} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t.email}</span>
                    <input type="email" className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder={t.email} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t.subject}</span>
                    <input className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder={t.subject} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t.message}</span>
                    <textarea className="min-h-36 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30" placeholder={t.message} />
                  </label>
                  <Button type="button" className="w-full rounded-full">
                    <Mail className="mr-2 h-4 w-4" />
                    {t.send}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function InfoCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Mail
  title: string
  description: string
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )

  return href ? (
    <a href={href} className="rounded-2xl border border-border/60 bg-background p-4 transition hover:bg-muted/30">
      {content}
    </a>
  ) : (
    <div className="rounded-2xl border border-border/60 bg-background p-4">{content}</div>
  )
}