"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import { fetchThemeHero, getThemeHeroText, DEFAULT_THEME_HERO, type ThemeHeroData } from "@/lib/theme-hero"

export function Hero() {
  const { locale, isRTL } = useLanguage()
  const [theme, setTheme] = useState<ThemeHeroData>(DEFAULT_THEME_HERO)

  useEffect(() => {
    const loadTheme = async () => {
      const data = await fetchThemeHero()
      setTheme(data)
    }

    void loadTheme()
  }, [])

  const text = getThemeHeroText(locale as Locale, theme)
  const mediaUrl = theme.mediaUrl || DEFAULT_THEME_HERO.mediaUrl
  const isImage = theme.mediaType === "image"

  return (
    <section className="relative min-h-[92svh] overflow-hidden pb-16 pt-24 sm:min-h-screen sm:pb-0 sm:pt-20" style={{ backgroundColor: '#e3e1e2' }}>
      {/* Background Video */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor: '#e3e1e2' }}
      >
        {isImage ? (
          <img
            src={mediaUrl}
            alt={text.title2}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={theme.mediaType === "video" ? undefined : mediaUrl}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover'
            }}
            >
            <source src={mediaUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/60" />
        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex min-h-[calc(92svh-6rem)] w-full items-center ${isRTL ? 'pr-4 sm:pr-6 lg:pr-0' : 'pl-4 sm:pl-6 lg:pl-0'}`}>
        <div className="mx-auto w-full max-w-7xl px-0 lg:px-8">
          <div className={`mx-auto w-full max-w-xl text-center ${isRTL ? 'lg:mx-0 lg:text-right' : 'lg:mx-0 lg:text-left'}`}>
            <span className="mb-4 block text-sm uppercase tracking-normal text-white animate-blur-in opacity-0 sm:mb-6" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              {text.subtitle}
            </span>
            <h2 className="mb-5 font-serif text-4xl leading-[1.06] text-balance text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block animate-blur-in opacity-0 font-semibold" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>{text.title1}</span>
              <span className="block animate-blur-in opacity-0 font-semibold text-5xl sm:text-6xl lg:text-8xl xl:text-9xl" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>{text.title2}</span>
            </h2>
            <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-white animate-blur-in opacity-0 sm:mb-10 sm:text-lg lg:mx-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              {text.description}
            </p>
            <div className={`flex animate-blur-in flex-col gap-4 opacity-0 sm:flex-row ${isRTL ? 'justify-center lg:justify-end' : 'justify-center lg:justify-start'}`} style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 text-sm tracking-wide text-primary-foreground boty-shadow boty-transition hover:bg-primary/90 sm:px-8"
              >
                {text.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white sm:flex">
        <span className="text-xs tracking-widest uppercase font-bold">{text.scroll}</span>
        <div className="w-px h-12 bg-white/25 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/70 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
