"use client"

import { useEffect, useRef, useState } from "react"
import { Leaf, Droplets, Sparkles, Flower2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const badges: Record<Locale, Array<{ icon: typeof Leaf; title: string; description: string }>> = {
  en: [
    { icon: Leaf, title: "Cold Pressed", description: "Preserved flavor and nutrients" },
    { icon: Droplets, title: "Pure Olive Oil", description: "No additives or blends" },
    { icon: Sparkles, title: "Trusted Quality", description: "Carefully selected at source" },
    { icon: Flower2, title: "Moroccan Heritage", description: "Rooted in family tradition" }
  ],
  fr: [
    { icon: Leaf, title: "Pressé à froid", description: "Saveur et nutriments préservés" },
    { icon: Droplets, title: "Huile pure", description: "Sans additifs ni mélanges" },
    { icon: Sparkles, title: "Qualité fiable", description: "Sélectionnée avec soin" },
    { icon: Flower2, title: "Héritage marocain", description: "Ancré dans la tradition familiale" }
  ],
  ar: [
    { icon: Leaf, title: "معصور على البارد", description: "يحافظ على النكهة والعناصر الغذائية" },
    { icon: Droplets, title: "زيت نقي", description: "من دون إضافات أو خلطات" },
    { icon: Sparkles, title: "جودة موثوقة", description: "مختار بعناية من المصدر" },
    { icon: Flower2, title: "تراث مغربي", description: "متجذر في تقاليد العائلة" }
  ]
}

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const localizedBadges = badges[locale as Locale]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
        >
          {localizedBadges.map((badge, index) => (
            <div
              key={badge.title}
              className={`rounded-xl border border-stone-200 bg-background p-5 text-center transition-all duration-700 ease-out border-none sm:p-6 lg:p-8 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <badge.icon className="text-primary mb-4 mx-auto size-12" strokeWidth={1} />
              <h3 className="mb-2 font-serif text-xl text-foreground sm:text-2xl">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
