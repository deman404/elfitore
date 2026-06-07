"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  DEFAULT_THEME_HOME_CATEGORIES,
  fetchThemeHomeCategories,
  type ThemeHomeCategoryCard,
  type ThemeHomeCategoriesData,
} from "@/lib/theme-home-categories"
import { type CatalogCategoryRow } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

function CategoryCard({ card, href }: { card: ThemeHomeCategoryCard; href: string }) {
  const { locale } = useLanguage()

  return (
    <Link href={href} className="group block h-full">
      <article className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[4/5] bg-muted">
          <Image
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.title[locale as Locale]}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
            <h3 className="font-serif text-xl sm:text-2xl">{card.title[locale as Locale]}</h3>
            <p className="mt-2 text-sm leading-6 text-white/85">{card.description[locale as Locale]}</p>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function HomeCategoriesSection() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const [data, setData] = useState<ThemeHomeCategoriesData>(DEFAULT_THEME_HOME_CATEGORIES)
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [next, categoriesResult] = await Promise.all([
        fetchThemeHomeCategories(),
        supabase
          .from("product_categories")
          .select("id, name, slug, active")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
      ])

      setData(next)
      setCategories((categoriesResult.data ?? []) as CatalogCategoryRow[])
      setLoading(false)
    }

    void load()
  }, [supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.12 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (!loading && data.cards.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 sm:mb-10 ${isRTL ? "text-right" : "text-left"}`}>
          <Link href="/category" className="inline-block">
            <span
              className={`mb-3 block text-xs uppercase tracking-[0.28em] text-primary sm:text-sm ${
                isVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={isVisible ? { animationDelay: "0.05s", animationFillMode: "forwards" } : {}}
            >
              {locale === "fr" ? "Catégories" : locale === "ar" ? "الفئات" : "Categories"}
            </span>
            <h2
              className={`max-w-2xl font-serif text-3xl text-foreground transition hover:text-primary sm:text-4xl lg:text-5xl ${
                isVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={isVisible ? { animationDelay: "0.15s", animationFillMode: "forwards" } : {}}
            >
              {locale === "fr"
                ? "Explorez nos catégories"
                : locale === "ar"
                  ? "استكشف فئاتنا"
                  : "Explore our categories"}
            </h2>
          </Link>
          <p
            className={`mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base ${
              isVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={isVisible ? { animationDelay: "0.25s", animationFillMode: "forwards" } : {}}
          >
            {locale === "fr"
              ? "Quatre catégories mises en avant, avec l’olive en premier sur mobile."
              : locale === "ar"
                ? "أربع فئات بارزة، مع الزيتون أولًا على الهاتف."
                : "Four featured categories, with olive shown first on mobile."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-card">
                <div className="aspect-[4/5] animate-pulse bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {data.cards.map((card, index) => (
              <div key={card.title.en}>
                <CategoryCard card={card} href={categories[index]?.id ? `/category/${categories[index].id}` : "/category"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
