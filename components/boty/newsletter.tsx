"use client"

import React from "react"

import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const text: Record<Locale, { title: string; description: string; subscribed: string; placeholder: string; button: string; footer: string }> = {
  en: {
    title: "Join the ritual",
    description: "Subscribe for exclusive offers, olive oil stories, and early access to new products.",
    subscribed: "Welcome to the El Fitore family!",
    placeholder: "Enter your email",
    button: "Subscribe",
    footer: "Unsubscribe anytime. We respect your inbox."
  },
  fr: {
    title: "Rejoignez le rituel",
    description: "Abonnez-vous pour recevoir des offres exclusives, des histoires autour de l’huile d’olive et un accès anticipé aux nouveautés.",
    subscribed: "Bienvenue dans la famille El Fitore !",
    placeholder: "Entrez votre e-mail",
    button: "S’abonner",
    footer: "Désabonnez-vous à tout moment. Nous respectons votre boîte mail."
  },
  ar: {
    title: "انضم إلى الطقس",
    description: "اشترك للحصول على عروض حصرية وحكايات عن زيت الزيتون ووصول مبكر إلى المنتجات الجديدة.",
    subscribed: "أهلًا بك في عائلة الفيتوري!",
    placeholder: "أدخل بريدك الإلكتروني",
    button: "اشترك",
    footer: "يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم بريدك الوارد."
  }
}

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { locale } = useLanguage()
  const t = text[locale as Locale]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
    }
  }

  return (
    <section className="bg-primary py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mb-4 text-balance font-serif text-3xl leading-tight text-primary-foreground sm:text-4xl md:text-6xl lg:text-7xl">
            {t.title}
          </h2>
          <p className="mb-8 text-base text-primary-foreground/80 sm:mb-10 sm:text-lg">
            {t.description}
          </p>

          {isSubscribed ? (
            <div className="inline-flex items-center gap-3 rounded-full bg-primary-foreground/10 px-6 py-4 backdrop-blur-sm sm:px-8">
              <Check className="w-5 h-5 text-primary-foreground" />
              <span className="text-primary-foreground">{t.subscribed}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-6 py-4 text-primary-foreground backdrop-blur-sm placeholder:text-primary-foreground/50 focus:border-primary-foreground/40 focus:outline-none boty-transition"
                required
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-8 py-4 text-sm tracking-wide text-primary boty-transition hover:bg-primary-foreground/90"
              >
                {t.button}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-primary-foreground/60">
            {t.footer}
          </p>
        </div>
      </div>
    </section>
  )
}
