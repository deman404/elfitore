"use client"

import { useEffect, useRef, useState } from "react"
import { Leaf, Flower2, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import { DEFAULT_THEME_CTA_BANNER, fetchThemeCtaBanner } from "@/lib/theme-cta-banner"

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [theme, setTheme] = useState(DEFAULT_THEME_CTA_BANNER)
  const bannerRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const localizedLocale = locale as Locale

  useEffect(() => {
    const loadTheme = async () => {
      const data = await fetchThemeCtaBanner()
      setTheme(data)
    }

    void loadTheme()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), {
      threshold: 0.1,
    })

    if (bannerRef.current) observer.observe(bannerRef.current)

    return () => {
      if (bannerRef.current) observer.unobserve(bannerRef.current)
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={bannerRef}
          className={`relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl p-6 transition-all duration-700 ease-out sm:min-h-[360px] sm:p-10 md:min-h-[400px] md:p-16 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <img
            src={theme.backgroundImageUrl}
            alt={theme.title2[localizedLocale]}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="relative z-10 max-w-2xl text-left">
            <h3 className="mb-4 text-3xl text-white sm:text-4xl lg:text-5xl">
              {theme.title1[localizedLocale]}
            </h3>
            <h3 className="mb-8 text-2xl text-white/70 sm:text-3xl md:text-4xl lg:text-5xl">
              {theme.title2[localizedLocale]}
            </h3>

            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <Leaf className="h-5 w-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{theme.leaf[localizedLocale]}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Flower2 className="h-5 w-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{theme.flower[localizedLocale]}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Globe className="h-5 w-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{theme.globe[localizedLocale]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
