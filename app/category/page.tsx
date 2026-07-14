"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  fetchThemeHomeCategories,
  isRenderableThemeHomeCategoryImageUrl,
  THEME_HOME_CATEGORY_FALLBACK_IMAGE,
} from "@/lib/theme-home-categories"
import { parseStringArray, type CatalogCategoryRow, type CatalogProductRow } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

type FeaturedCategoryCard = {
  id: number
  href: string
  title: string
  description: string
  imageUrl: string
}

const pageText: Record<
  Locale,
  {
    eyebrow: string
    title: string
    description: string
    browse: string
    viewCategory: string
    empty: string
  }
> = {
  en: {
    eyebrow: "Categories",
    title: "Browse every category",
    description: "Start with the curated overview, then open any collection to see its products.",
    browse: "Browse categories",
    viewCategory: "View category",
    empty: "No active categories are available right now.",
  },
  fr: {
  eyebrow: "Catégories",
    title: "Parcourir toutes les catégories",
    description: "Commencez par l'aperçu des catégories, puis ouvrez une collection pour voir ses produits.",
    browse: "Parcourir les catégories",
    viewCategory: "Voir la catégorie",
    empty: "Aucune catégorie active n'est disponible pour le moment.",
  },
  ar: {
    eyebrow: "الفئات",
    title: "تصفح جميع الفئات",
    description: "ابدأ بالنظرة العامة المختارة، ثم افتح أي مجموعة لرؤية منتجاتها.",
    browse: "تصفح الفئات",
    viewCategory: "عرض الفئة",
    empty: "لا توجد فئات نشطة متاحة حالياً.",
  },
}

export default function CategoryIndexPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const t = pageText[locale as Locale]
  const [cards, setCards] = useState<FeaturedCategoryCard[]>([])
  const [heroImage, setHeroImage] = useState("/images/products/oil.jpg")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)

      try {
        const [themeCategories, categoriesResult, productsResult] = await Promise.all([
          fetchThemeHomeCategories(),
          supabase
            .from("product_categories")
            .select("id, name, slug, description, active, sort_order")
            .eq("active", true)
            .order("sort_order", { ascending: true }),
          supabase.from("products").select("id, category, image, images").order("id", { ascending: false }),
        ])

        const categories = (categoriesResult.data ?? []) as Array<
          CatalogCategoryRow & { description: string | null; sort_order?: number | null }
        >
        const products = (productsResult.data ?? []) as CatalogProductRow[]
        const firstImageByCategory = new Map<string, string>()

        for (const product of products) {
          if (firstImageByCategory.has(product.category)) continue

          const image = product.image || parseStringArray(product.images)[0] || ""
          if (image) {
            firstImageByCategory.set(product.category, image)
          }
        }

        const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))

        const nextCards = themeCategories.cards.map((card, index) => {
          const title = getLocalizedCardText(card.title, locale)
          const description = getLocalizedCardText(card.description, locale) || t.description
          const matchedCategory = card.categorySlug ? categoryBySlug.get(card.categorySlug) : undefined
          const fallbackCategory = categories[index]
          const resolvedCategory = matchedCategory ?? fallbackCategory

          const href = resolvedCategory ? `/category/${resolvedCategory.slug}` : "/category"
          const imageUrl = isRenderableThemeHomeCategoryImageUrl(card.imageUrl)
            ? card.imageUrl
            : (resolvedCategory ? firstImageByCategory.get(resolvedCategory.slug) : "") ||
              THEME_HOME_CATEGORY_FALLBACK_IMAGE

          return {
            id: resolvedCategory?.id ?? index + 1,
            href,
            title,
            description,
            imageUrl,
          }
        })

        setCards(nextCards)
        setHeroImage(nextCards[0]?.imageUrl || "/images/products/oil.jpg")
      } catch {
        setCards([])
        setHeroImage("/images/products/oil.jpg")
      } finally {
        setLoading(false)
      }
    }

    void loadCategories()
  }, [locale, supabase, t.description])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pb-20 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
            <div className="relative aspect-[16/7] min-h-[260px]">
              <Image src={heroImage} alt={t.eyebrow} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-10 ${isRTL ? "text-right" : "text-left"}`}>
                <p className="text-xs uppercase tracking-[0.28em] text-white/80">{t.eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{t.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{t.description}</p>
              </div>
            </div>
          </section>

          <section className="mt-10 sm:mt-12">
            <div className={`mb-6 flex items-end justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary">{t.browse}</p>
                <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
                  {loading ? "..." : `${cards.length} ${t.eyebrow.toLowerCase()}`}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-3xl border border-border/60 bg-card animate-pulse" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                {t.empty}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="group overflow-hidden rounded-[1.75rem] border border-border/60 bg-background shadow-sm transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex h-full flex-col justify-between p-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-primary">Category</p>
                        <h3 className="mt-3 font-serif text-2xl text-foreground">{card.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
                      </div>
                      <div
                        className={`mt-6 flex items-center gap-2 text-sm font-medium text-foreground ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <span>{t.viewCategory}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function getLocalizedCardText(text: Record<Locale, string>, locale: Locale) {
  return text[locale] || text.en || ""
}
