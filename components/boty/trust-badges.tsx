"use client"

import { useEffect, useRef, useState } from "react"
import { Droplets, Flower2, Globe, Leaf, Recycle, ShieldCheck, Sparkles, Truck } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import {
  DEFAULT_THEME_TRUST_BADGES,
  fetchThemeTrustBadges,
  normalizeThemeTrustBadgeIcon,
  type ThemeTrustBadgeIcon,
} from "@/lib/theme-trust-badges"

const icons: Record<ThemeTrustBadgeIcon, typeof Leaf> = {
  leaf: Leaf,
  droplets: Droplets,
  sparkles: Sparkles,
  flower: Flower2,
  recycle: Recycle,
  globe: Globe,
  shield: ShieldCheck,
  truck: Truck,
}

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
        <div ref={sectionRef} className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {theme.badges.map((badge, index) => {
            const fallbackIcon = DEFAULT_THEME_TRUST_BADGES.badges[index]?.icon
            const Icon = icons[normalizeThemeTrustBadgeIcon(badge.icon, fallbackIcon)]

            return (
              <div
                key={badge.title.en}
                className={`rounded-xl border border-stone-200 bg-background p-4 text-center transition-all duration-700 ease-out border-none sm:p-6 lg:p-8 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Icon className="mx-auto mb-3 size-9 text-primary sm:mb-4 sm:size-12" strokeWidth={1} />
                <h3 className="mb-2 font-serif text-lg text-foreground sm:text-2xl">
                  {badge.title[localizedLocale]}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">{badge.description[localizedLocale]}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
