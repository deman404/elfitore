"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { DEFAULT_THEME_HOME_CATEGORIES } from "@/lib/theme-home-categories"
import type { Locale } from "@/i18n.config"

type CategoryRecord = {
  id: number
  name: string
  slug: string
  description: string | null
  active: boolean
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
    description: "Start with the category overview, then open any collection to see its products.",
    browse: "Browse categories",
    viewCategory: "View category",
    empty: "No active categories are available right now.",
  },
  fr: {
    eyebrow: "Catégories",
    title: "Parcourir toutes les catégories",
    description: "Commencez par l’aperçu des catégories, puis ouvrez une collection pour voir ses produits.",
    browse: "Parcourir les catégories",
    viewCategory: "Voir la catégorie",
    empty: "Aucune catégorie active n’est disponible pour le moment.",
  },
  ar: {
    eyebrow: "الفئات",
    title: "تصفّح جميع الفئات",
    description: "ابدأ بنظرة عامة على الفئات، ثم افتح أي مجموعة لرؤية منتجاتها.",
    browse: "تصفح الفئات",
    viewCategory: "عرض الفئة",
    empty: "لا توجد فئات نشطة متاحة الآن.",
  },
}

export default function CategoryIndexPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const t = pageText[locale as Locale]
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const heroImage = DEFAULT_THEME_HOME_CATEGORIES.cards[0]?.imageUrl || "/placeholder.svg"

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name, slug, description, active")
        .eq("active", true)
        .order("sort_order", { ascending: true })

      if (error) {
        setCategories([])
      } else {
        setCategories((data ?? []) as CategoryRecord[])
      }

      setLoading(false)
    }

    void loadCategories()
  }, [supabase])

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
              <Image
                src={heroImage}
                alt={t.eyebrow}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-10 ${isRTL ? "text-right" : "text-left"}`}>
                <p className="text-xs uppercase tracking-[0.28em] text-white/80">{t.eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{t.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {t.description}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10 sm:mt-12">
            <div className={`mb-6 flex items-end justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary">{t.browse}</p>
                <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
                  {loading ? "..." : `${categories.length} ${t.eyebrow.toLowerCase()}`}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-3xl border border-border/60 bg-card animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                {t.empty}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.id}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-border/60 bg-background shadow-sm transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex h-full flex-col justify-between p-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-primary">Category</p>
                        <h3 className="mt-3 font-serif text-2xl text-foreground">{category.name}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {category.description || t.description}
                        </p>
                      </div>
                      <div className={`mt-6 flex items-center gap-2 text-sm font-medium text-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
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
