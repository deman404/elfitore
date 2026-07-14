"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  normalizeProductRow,
  type CatalogCategoryRow,
  type CatalogProductRow,
  type NormalizedProduct,
} from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

const pageText: Record<
  Locale,
  {
    collection: string
    title: string
    description: string
    filters: string
    products_one: string
    products_other: string
    allProducts: string
  }
> = {
  en: {
    collection: "Our Collection",
    title: "Shop All Products",
    description: "Discover our complete range of natural Moroccan products",
    filters: "Filters",
    products_one: "product",
    products_other: "products",
    allProducts: "All Products",
  },
  fr: {
    collection: "Notre collection",
    title: "Tous les produits",
    description: "Découvrez notre gamme complète de produits marocains naturels",
    filters: "Filtres",
    products_one: "produit",
    products_other: "produits",
    allProducts: "Tous les produits",
  },
  ar: {
    collection: "مجموعتنا",
    title: "تسوق جميع المنتجات",
    description: "اكتشف مجموعتنا الكاملة من المنتجات المغربية الطبيعية",
    filters: "الفلاتر",
    products_one: "منتج",
    products_other: "منتجات",
    allProducts: "جميع المنتجات",
  },
}

type FilterCategory = "all" | string

export default function ShopPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)
  const { locale, isRTL } = useLanguage()
  const t = pageText[locale as Locale]

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => product.category === selectedCategory)

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true)
      setError("")

      try {
        const [productsResult, categoriesResult] = await Promise.all([
          supabase.from("products").select("*").order("id", { ascending: false }),
          supabase
            .from("product_categories")
            .select("id, name, slug, active")
            .eq("active", true)
            .order("sort_order", { ascending: true }),
        ])

        if (productsResult.error) {
          setProducts([])
          setError(`Could not load products: ${productsResult.error.message}`)
        } else {
          setProducts(((productsResult.data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
        }

        if (categoriesResult.error) {
          setCategories([])
        } else {
          setCategories((categoriesResult.data ?? []) as CatalogCategoryRow[])
        }
      } catch (error) {
        setProducts([])
        setCategories([])
        setError(error instanceof Error ? error.message : "Could not load the catalog.")
      } finally {
        setLoading(false)
      }
    }

    void loadCatalog()
  }, [supabase])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setIsVisible(false)
    const timer = window.setTimeout(() => setIsVisible(true), 50)
    return () => window.clearTimeout(timer)
  }, [selectedCategory])

  const handleSelect = (category: FilterCategory) => {
    if (category === selectedCategory) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedCategory(category)
      setShowFilters(false)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 180)
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pb-16 pt-24 sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mb-10 text-center sm:mb-12 ${isRTL ? "rtl" : "ltr"}`}>
            <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-primary sm:text-sm">
              {t.collection}
            </span>
            <h1 className="mb-4 text-balance font-serif text-3xl text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base lg:text-lg">
              {t.description}
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 border-b border-border/50 pb-6 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 self-start text-sm text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t.filters}
            </button>

            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                }`}
              >
                {t.allProducts}
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => handleSelect(category.slug)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? t.products_one : t.products_other}
            </span>
          </div>

          {showFilters ? (
            <div className="fixed inset-0 z-50 bg-background lg:hidden">
              <div className="p-5 sm:p-6">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="font-serif text-2xl text-foreground">{t.filters}</h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-foreground/70 hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelect("all")}
                    className={`w-full rounded-2xl px-6 py-4 text-left transition ${
                      selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card text-foreground boty-shadow"
                    }`}
                  >
                    {t.allProducts}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => handleSelect(category.slug)}
                      className={`w-full rounded-2xl px-6 py-4 text-left transition ${
                        selectedCategory === category.slug ? "bg-primary text-primary-foreground" : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl bg-card p-4 shadow-sm">
                  <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
                  <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground">
                No products available from Supabase yet.
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isVisible={isVisible}
                  isTransitioning={isTransitioning}
                  locale={locale as Locale}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function ProductCard({
  product,
  index,
  isVisible,
  isTransitioning,
  locale,
}: {
  product: NormalizedProduct
  index: number
  isVisible: boolean
  isTransitioning: boolean
  locale: Locale
}) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="overflow-hidden rounded-3xl bg-card boty-shadow boty-transition group-hover:scale-[1.02]">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name[locale]}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover boty-transition group-hover:scale-105"
          />
          <button
            type="button"
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 opacity-0 translate-y-2 backdrop-blur-sm boty-shadow boty-transition group-hover:opacity-100 group-hover:translate-y-0"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            aria-label={locale === "fr" ? "Ajouter au panier" : locale === "ar" ? "أضف إلى السلة" : "Add to cart"}
          >
            <ShoppingBag className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="mb-1 font-serif text-xl text-foreground">{product.name[locale]}</h3>
          <p
            className="mb-4 text-sm text-muted-foreground"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {product.description[locale]}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">DH {product.price}</span>
            {product.sizes.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {product.sizes[0].label}
                {product.sizes.length > 1 ? ` +${product.sizes.length - 1}` : ""}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
