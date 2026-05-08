"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Recycle, Leaf, Flower2, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const features: Record<Locale, Array<{ icon: typeof Recycle; title: string; description: string }>> = {
  en: [
    { icon: Recycle, title: "Moroccan Groves", description: "Handpicked olives from sun-soaked Moroccan orchards" },
    { icon: Leaf, title: "Pure Olive Oil", description: "Cold-pressed for a rich, smooth, golden finish" },
    { icon: Flower2, title: "Olive Heritage", description: "A family tradition shaped by olive trees and care" },
    { icon: Globe, title: "Loved Across Morocco", description: "A taste that feels at home in every Moroccan kitchen" }
  ],
  fr: [
    { icon: Recycle, title: "Vergers marocains", description: "Des olives cueillies à la main dans les vergers baignés de soleil" },
    { icon: Leaf, title: "Huile pure", description: "Pressée à froid pour une finale riche, douce et dorée" },
    { icon: Flower2, title: "Héritage oléicole", description: "Une tradition familiale façonnée par les oliviers et le soin" },
    { icon: Globe, title: "Apprécié partout au Maroc", description: "Un goût qui se sent chez lui dans chaque cuisine marocaine" }
  ],
  ar: [
    { icon: Recycle, title: "بساتين مغربية", description: "زيتون مختار يدويًا من بساتين المغرب المشمسة" },
    { icon: Leaf, title: "زيت زيتون نقي", description: "معصور على البارد بنهاية غنية وناعمة وذهبية" },
    { icon: Flower2, title: "تراث الزيتون", description: "تقليد عائلي تشكل مع أشجار الزيتون والعناية" },
    { icon: Globe, title: "محبوب في كل المغرب", description: "طعم يشعر بالانتماء إلى كل مطبخ مغربي" }
  ]
}

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const { locale } = useLanguage()
  const bentoRef = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const localizedFeatures = features[locale as Locale]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    if (videoSectionRef.current) {
      videoObserver.observe(videoSectionRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
      if (videoSectionRef.current) {
        videoObserver.unobserve(videoSectionRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Bento Grid */}
        <div
          ref={bentoRef}
          className="mb-14 grid gap-4 md:grid-cols-4 md:grid-rows-[300px_300px] lg:mb-20 lg:gap-6"
        >
          {/* Left Large Block - Video with Overlay Card */}
          <div
            className={`relative h-[320px] overflow-hidden rounded-3xl transition-all duration-700 ease-out sm:h-[420px] md:col-span-2 md:row-span-2 md:h-auto ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            style={{ transitionDelay: '0ms' }}
          >
            <Image
              src="/product2.png"
              width={500}
              height={500}
              alt={locale === 'fr' ? 'Huile d’olive marocaine' : locale === 'ar' ? 'زيت زيتون مغربي' : 'Moroccan olive oil'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white p-6 shadow-lg rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">

                </div>
                  <div>
                    <h3 className="mb-2 text-lg font-medium text-foreground sm:text-xl">
                    {locale === 'fr' ? 'Adopté par' : locale === 'ar' ? 'محبوب لدى' : 'Loved by'} <span className="">{locale === 'fr' ? 'des milliers' : locale === 'ar' ? 'الآلاف' : 'thousands'}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {locale === 'fr'
                      ? 'Huile d’olive et olives marocaines pures, du verger à la table.'
                      : locale === 'ar'
                        ? 'زيت زيتون وزيتون مغربي نقي، من البستان إلى المائدة.'
                        : 'Pure Moroccan olive oil and olives, crafted from the grove to the table.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right - 100% Natural */}
          <div
            className={`relative flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-black/15 to-transparent p-5 transition-all duration-700 ease-out sm:p-6 md:col-span-2 md:p-8 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Background Image */}
            <Image
              src="/product.png"
              alt="Natural ingredients"
              fill
              className="object-cover"
            />


            <div className="relative z-10">
              <h3 className="mb-2 text-2xl text-black sm:text-3xl md:text-4xl">
                {locale === 'fr' ? 'Olive marocaine' : locale === 'ar' ? 'زيتون مغربي' : 'Moroccan Olive'}
              </h3>
              <h3 className="mb-4 text-xl text-black/70 sm:text-2xl md:text-3xl">
                {locale === 'fr'
                  ? 'Doré, frais et plein de caractère'
                  : locale === 'ar'
                    ? 'ذهبي وطازج ومليء بالشخصية'
                    : 'Golden, fresh, and full of character'}
              </h3>

              <div className="space-y-2 rounded-2xl bg-white/35 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-black/90">
                  <Leaf className="w-4 h-4 flex-shrink-0" />
                  <span>{locale === 'fr' ? 'Olives cueillies à la main' : locale === 'ar' ? 'زيتون مختار يدويًا' : 'Handpicked olives'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black/90">
                  <Flower2 className="w-4 h-4 flex-shrink-0" />
                  <span>{locale === 'fr' ? 'Huile d’olive pressée à froid' : locale === 'ar' ? 'زيت زيتون معصور على البارد' : 'Cold-pressed olive oil'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black/90">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span>{locale === 'fr' ? 'Un favori de la cuisine marocaine' : locale === 'ar' ? 'مفضل في المطبخ المغربي' : 'Moroccan kitchen favorite'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Eco-Friendly Packaging */}
          <div
            className={`relative flex flex-col justify-center overflow-hidden rounded-3xl p-5 transition-all duration-700 ease-out sm:p-6 md:col-span-2 md:p-8 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Background Video */}
            <Image
              src="/product2.png"
              width={500}
              height={500}
              alt={locale === 'fr' ? 'Huile d’olive marocaine' : locale === 'ar' ? 'زيت زيتون مغربي' : 'Moroccan olive oil'}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-transparent" />

            <div className="relative z-10 flex flex-col justify-center h-full text-left items-start">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
                <Recycle className="w-8 h-8 text-black" />
              </div>
              <h3 className="mb-1 font-sans text-sm text-black sm:text-base">
                {locale === 'fr' ? 'Des oliveraies' : locale === 'ar' ? 'من بساتين الزيتون' : 'From Olive Groves'}
              </h3>
              <h3 className="mb-2 text-xl text-black sm:text-2xl md:text-3xl">
                {locale === 'fr' ? 'aux tables marocaines' : locale === 'ar' ? 'إلى الموائد المغربية' : 'to Moroccan Tables'}
              </h3>
            </div>
          </div>
        </div>

        <div
          ref={videoSectionRef}
          className="my-0 grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-20 lg:py-20"
        >
          {/* Video */}
          <div
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <Image
              src="/product3.png"
              width={500}
              height={500}
              alt={locale === 'fr' ? 'Héritage de l’huile d’olive marocaine' : locale === 'ar' ? 'تراث زيت الزيتون المغربي' : 'Moroccan olive oil heritage'}
              className="absolute inset-0 w-full h-full object-cover"
            />

          </div>

          {/* Content */}
          <div
            ref={headerRef}
            className={`transition-all duration-700 ease-out ${isVideoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{ transitionDelay: '100ms' }}
          >
            <span className={`mb-4 block text-xs uppercase tracking-[0.3em] text-primary sm:text-sm ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
              {locale === 'fr' ? 'Tradition de l’olive marocaine' : locale === 'ar' ? 'تقليد الزيتون المغربي' : 'Moroccan Olive Tradition'}
            </span>
            <h2 className={`mb-5 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
              {locale === 'fr'
                ? 'Adopté par des milliers, enraciné au Maroc.'
                : locale === 'ar'
                  ? 'محبوب لدى الآلاف، ومتجذر في المغرب.'
                  : 'Loved by thousands, rooted in Morocco.'}
            </h2>
            <p className={`mb-8 max-w-md text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-lg ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
              {locale === 'fr'
                ? 'Des olives cultivées sous le soleil marocain à l’huile d’olive vierge extra servie à table, chaque bouteille porte la chaleur, la saveur et le caractère du verger.'
                : locale === 'ar'
                  ? 'من الزيتون الذي ينمو تحت الشمس المغربية إلى زيت الزيتون البكر الممتاز على المائدة، تحمل كل زجاجة دفء البستان ونكهته وشخصيته.'
                  : 'From olives grown under the Moroccan sun to extra virgin olive oil poured at the table, every bottle carries the warmth, flavor, and character of the grove.'}
            </p>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {localizedFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-md bg-white p-5 boty-transition hover:scale-[1.02]"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 group-hover:bg-primary/20 boty-transition bg-stone-50">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
