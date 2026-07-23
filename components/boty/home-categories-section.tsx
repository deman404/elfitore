"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useCategories, getCategoryName, getCategoryDescription } from "@/components/category-context"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  fetchThemeHomeCategories,
  isRenderableThemeHomeCategoryImageUrl,
  THEME_HOME_CATEGORY_FALLBACK_IMAGE,
} from "@/lib/theme-home-categories"
import { parseStringArray, type CatalogProductRow } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

type FeaturedCategoryCard = {
  id: number
  href: string
  title: string
  description: string
  imageUrl: string
}

function CategoryCard({ card }: { card: FeaturedCategoryCard }) {
  return (
    <Link href={card.href} className="group block h-full">
      <article className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[4/5] bg-muted">
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
            <h3 className="font-serif text-xl sm:text-2xl">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/85">{card.description}</p>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function HomeCategoriesSection() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const { categories, loading: categoriesLoading } = useCategories()
  const [cards, setCards] = useState<FeaturedCategoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const fallbackDescription =
    locale === "fr"
      ? "Découvrez les produits de cette catégorie."
      : locale === "ar"
        ? "استكشف منتجات هذه الفئة."
        : "Discover the products in this category."

  useEffect(() => {
    if (categoriesLoading) return

    const load = async () => {
      setLoading(true)
      try {
        const [themeCategories, productsResult] = await Promise.all([
          fetchThemeHomeCategories(),
          supabase
            .from("products")
            .select("id, category, image, images")
            .order("id", { ascending: false }),
        ])

        const products = (productsResult.data ?? []) as CatalogProductRow[]
        const firstImageByCategory = new Map<string, string>()

        for (const product of products) {
          if (firstImageByCategory.has(product.category)) continue
          const image = product.image || parseStringArray(product.images)[0] || ""
          if (image) {
            firstImageByCategory.set(product.category, image)
          }
        }

        // Curated theme data keyed by category slug — image AND localized text
        const themeImageBySlug = new Map<string, string>()
        const themeTitleBySlug = new Map<string, Record<Locale, string>>()
        const themeDescriptionBySlug = new Map<string, Record<Locale, string>>()

        for (const card of themeCategories.cards) {
          if (!card.categorySlug) continue
          const slugKey = card.categorySlug.toLowerCase()

          if (isRenderableThemeHomeCategoryImageUrl(card.imageUrl)) {
            themeImageBySlug.set(slugKey, card.imageUrl)
          }
          if (card.title) themeTitleBySlug.set(slugKey, card.title)
          if (card.description) themeDescriptionBySlug.set(slugKey, card.description)
        }

        setCards(
  categories.map((category) => {
    const slugKey = category.slug.toLowerCase()
    const localizedTitle = themeTitleBySlug.get(slugKey)
    const localizedDescription = themeDescriptionBySlug.get(slugKey)

    return {
      id: category.id,
      href: `/category/${category.slug}`,
      title: getCategoryName(category, locale) || (localizedTitle?.[locale] || localizedTitle?.en) || category.name,
      description:
        getCategoryDescription(category, locale) ||
        (localizedDescription?.[locale] || localizedDescription?.en) ||
        category.description ||
        fallbackDescription,
      imageUrl:
        themeImageBySlug.get(slugKey) ||
        firstImageByCategory.get(category.slug) ||
        THEME_HOME_CATEGORY_FALLBACK_IMAGE,
    }
  })
)
      } catch {
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [categories, categoriesLoading, fallbackDescription, locale, supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.12 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (!loading && cards.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 sm:mb-10 ${isRTL ? "text-right" : "text-left"}`}>
          <Link href="/shop" className="group inline-block cursor-pointer">
            <span
              className={`mb-3 block text-xs uppercase tracking-[0.28em] text-primary sm:text-sm transition group-hover:text-primary/80 ${
                isVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={isVisible ? { animationDelay: "0.05s", animationFillMode: "forwards" } : {}}
            >
              {locale === "fr" ? "Catégories" : locale === "ar" ? "الفئات" : "Categories"}
            </span>
            <h2
              className={`max-w-2xl font-serif text-3xl text-foreground transition group-hover:text-primary sm:text-4xl lg:text-5xl ${
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
            <p
              className={`mt-3 max-w-2xl text-sm text-muted-foreground transition group-hover:text-foreground sm:text-base ${
                isVisible ? "animate-blur-in opacity-0" : "opacity-0"
              }`}
              style={isVisible ? { animationDelay: "0.25s", animationFillMode: "forwards" } : {}}
            >
              {locale === "fr"
                ? "Explorez les catégories réelles du catalogue."
                : locale === "ar"
                  ? "استكشف فئات الكتالوج الحقيقية."
                  : "Explore the real catalog categories."}
            </p>
          </Link>
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
            {cards.map((card) => (
              <CategoryCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}