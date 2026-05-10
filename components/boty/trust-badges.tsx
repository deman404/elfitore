"use client"

import { useEffect, useRef, useState } from "react"
import { Leaf, Droplets, Sparkles, Flower2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import { DEFAULT_THEME_TRUST_BADGES, fetchThemeTrustBadges } from "@/lib/theme-trust-badges"

const icons = [Leaf, Droplets, Sparkles, Flower2] as const

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const [theme, setTheme] = useState(DEFAULT_THEME_TRUST_BADGES)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const localizedLocale = locale as Locale

  useEffect(() => {
    const loadTheme = async () => {
      const data = await fetchThemeTrustBadges()
      setTheme(data)
    }

    void loadTheme()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), {
      threshold: 0.1,
    })

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current)
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {theme.badges.map((badge, index) => {
            const Icon = icons[index] ?? Leaf

            return (
              <div
                key={badge.title.en}
                className={`rounded-xl border border-stone-200 bg-background p-5 text-center transition-all duration-700 ease-out border-none sm:p-6 lg:p-8 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Icon className="mx-auto mb-4 size-12 text-primary" strokeWidth={1} />
                <h3 className="mb-2 font-serif text-xl text-foreground sm:text-2xl">
                  {badge.title[localizedLocale]}
                </h3>
                <p className="text-sm text-muted-foreground">{badge.description[localizedLocale]}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
