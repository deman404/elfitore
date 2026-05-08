"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Leaf, Flower2, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const text: Record<Locale, { title1: string; title2: string; leaf: string; flower: string; globe: string }> = {
  en: {
    title1: "100% Natural",
    title2: "From Morocco with care",
    leaf: "No harsh chemicals",
    flower: "Plant-based goodness",
    globe: "Ethically sourced"
  },
  fr: {
    title1: "100% naturel",
    title2: "Du Maroc avec soin",
    leaf: "Sans produits agressifs",
    flower: "Bienfaits d'origine végétale",
    globe: "Sourcé de façon éthique"
  },
  ar: {
    title1: "طبيعي 100%",
    title2: "من المغرب بعناية",
    leaf: "من دون مواد قاسية",
    flower: "خير نباتي طبيعي",
    globe: "مصادر أخلاقية"
  }
}

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const t = text[locale as Locale]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={bannerRef}
          className={`relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl p-6 transition-all duration-700 ease-out sm:min-h-[360px] sm:p-10 md:min-h-[400px] md:p-16 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Background Image */}
          <Image
            src="/product4.png"
            alt="Natural ingredients"
            fill
            className="object-cover"
          />
          
          <div className="relative z-10 max-w-2xl text-left">
            <h3 className="mb-4 text-3xl text-white sm:text-4xl lg:text-5xl">
              {t.title1}
            </h3>
            <h3 className="mb-8 text-2xl text-white/70 sm:text-3xl md:text-4xl lg:text-5xl">
              {t.title2}
            </h3>
            
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <Leaf className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{t.leaf}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Flower2 className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{t.flower}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Globe className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm sm:text-base">{t.globe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
