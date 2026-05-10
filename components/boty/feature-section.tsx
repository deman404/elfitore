"use client"

import { useEffect, useRef, useState } from "react"
import { Recycle, Leaf, Flower2, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import { DEFAULT_THEME_FEATURE_SECTION, fetchThemeFeatureSection } from "@/lib/theme-feature-section"

const icons = [Recycle, Leaf, Flower2, Globe] as const

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [theme, setTheme] = useState(DEFAULT_THEME_FEATURE_SECTION)
  const { locale } = useLanguage()
  const bentoRef = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const localizedLocale = locale as Locale

  useEffect(() => {
    const loadTheme = async () => {
      const data = await fetchThemeFeatureSection()
      setTheme(data)
    }

    void loadTheme()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 })
    const videoObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVideoVisible(true), { threshold: 0.1 })
    const headerObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setHeaderVisible(true), { threshold: 0.1 })

    if (bentoRef.current) observer.observe(bentoRef.current)
    if (videoSectionRef.current) videoObserver.observe(videoSectionRef.current)
    if (headerRef.current) headerObserver.observe(headerRef.current)

    return () => {
      if (bentoRef.current) observer.unobserve(bentoRef.current)
      if (videoSectionRef.current) videoObserver.unobserve(videoSectionRef.current)
      if (headerRef.current) headerObserver.unobserve(headerRef.current)
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={bentoRef} className="mb-14 grid gap-4 md:grid-cols-4 md:grid-rows-[300px_300px] lg:mb-20 lg:gap-6">
          <div
            className={`relative h-[320px] overflow-hidden rounded-3xl transition-all duration-700 ease-out sm:h-[420px] md:col-span-2 md:row-span-2 md:h-auto ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <img
              src={theme.leftImageUrl}
              alt={theme.overlayTitle[localizedLocale]}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-8 left-8 right-8 rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-medium text-foreground sm:text-xl">
                {theme.overlayTitle[localizedLocale]}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {theme.overlayDescription[localizedLocale]}
              </p>
            </div>
          </div>

          <div
            className={`relative flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-black/15 to-transparent p-5 transition-all duration-700 ease-out sm:p-6 md:col-span-2 md:p-8 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <img
              src={theme.topImageUrl}
              alt={theme.topTitle[localizedLocale]}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative z-10">
              <h3 className="mb-2 text-2xl text-black sm:text-3xl md:text-4xl">{theme.topTitle[localizedLocale]}</h3>
              <h3 className="mb-4 text-xl text-black/70 sm:text-2xl md:text-3xl">{theme.topSubtitle[localizedLocale]}</h3>

              <div className="space-y-2 rounded-2xl bg-white/35 p-4 backdrop-blur-sm">
                {[theme.topBullet1, theme.topBullet2, theme.topBullet3].map((bullet, index) => {
                  const BulletIcon = [Leaf, Flower2, Globe][index]

                  return (
                    <div key={bullet.en} className="flex items-center gap-2 text-sm text-black/90">
                      <BulletIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{bullet[localizedLocale]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div
            className={`relative flex flex-col justify-center overflow-hidden rounded-3xl p-5 transition-all duration-700 ease-out sm:p-6 md:col-span-2 md:p-8 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <img
              src={theme.bottomImageUrl}
              alt={theme.bottomTitle[localizedLocale]}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative z-10 flex h-full flex-col items-start justify-center text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
                <Recycle className="w-8 h-8 text-black" />
              </div>
              <h3 className="mb-1 font-sans text-sm text-black sm:text-base">{theme.bottomEyebrow[localizedLocale]}</h3>
              <h3 className="mb-2 text-xl text-black sm:text-2xl md:text-3xl">{theme.bottomTitle[localizedLocale]}</h3>
            </div>
          </div>
        </div>

        <div ref={videoSectionRef} className="my-0 grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <div
            className={`relative aspect-[4/5] overflow-hidden rounded-3xl boty-shadow transition-all duration-700 ease-out ${
              isVideoVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <img
              src={theme.videoImageUrl}
              alt={theme.sectionTitle[localizedLocale]}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div
            ref={headerRef}
            className={`transition-all duration-700 ease-out ${
              isVideoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <span
              className={`mb-4 block text-xs uppercase tracking-[0.3em] text-primary sm:text-sm ${
                headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={headerVisible ? { animationDelay: "0.2s", animationFillMode: "forwards" } : {}}
            >
              {theme.sectionEyebrow[localizedLocale]}
            </span>
            <h2
              className={`mb-5 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-7xl ${
                headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={headerVisible ? { animationDelay: "0.4s", animationFillMode: "forwards" } : {}}
            >
              {theme.sectionTitle[localizedLocale]}
            </h2>
            <p
              className={`mb-8 max-w-md text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-lg ${
                headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={headerVisible ? { animationDelay: "0.6s", animationFillMode: "forwards" } : {}}
            >
              {theme.sectionDescription[localizedLocale]}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {theme.cards.map((feature, index) => {
                const Icon = icons[index] ?? Leaf
                return (
                  <div
                    key={feature.title.en}
                    className={`rounded-2xl border border-stone-200 bg-background p-5 transition-all duration-700 ease-out sm:p-6 ${
                      headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 100 + 700}ms` }}
                  >
                    <Icon className="mb-4 size-12 text-primary" strokeWidth={1} />
                    <h3 className="mb-2 font-serif text-xl text-foreground sm:text-2xl">
                      {feature.title[localizedLocale]}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description[localizedLocale]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
