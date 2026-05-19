"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-context"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

type YouMayLikeSectionProps = {
  title?: string
  subtitle?: string
  focusCategory?: string
  excludeProductIds?: Array<string | number>
  limit?: number
  mobileColumns?: 1 | 2
  compact?: boolean
  className?: string
}

const translations = {
  en: {
    title: "You may like",
    subtitle: "A few more products worth exploring",
    viewProduct: "View product",
    quickAdd: "Quick add",
    loading: "Loading recommendations...",
    empty: "More products will appear here soon.",
  },
  fr: {
    title: "Vous aimerez peut-être",
    subtitle: "Quelques produits supplémentaires à découvrir",
    viewProduct: "Voir le produit",
    quickAdd: "Ajout rapide",
    loading: "Chargement des recommandations...",
    empty: "D’autres produits apparaîtront bientôt ici.",
  },
  ar: {
    title: "قد يعجبك",
    subtitle: "بعض المنتجات الإضافية التي تستحق الاستكشاف",
    viewProduct: "عرض المنتج",
    quickAdd: "إضافة سريعة",
    loading: "جاري تحميل الاقتراحات...",
    empty: "ستظهر المزيد من المنتجات هنا قريبًا.",
  },
} as const

export function YouMayLikeSection({
  title,
  subtitle,
  focusCategory,
  excludeProductIds = [],
  limit = 4,
  mobileColumns = 1,
  compact = false,
  className = "",
}: YouMayLikeSectionProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const { addItem } = useCart()
  const t = translations[locale as Locale]
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)

      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false })

      if (error) {
        setProducts([])
        setLoading(false)
        return
      }

      setProducts(((data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      setLoading(false)
    }

    void loadProducts()
  }, [supabase])

  const excludedIds = new Set(excludeProductIds.map((value) => String(value)))

  const filteredProducts = products.filter((product) => !excludedIds.has(product.id))
  const preferredProducts = focusCategory
    ? [
        ...filteredProducts.filter((product) => product.category === focusCategory),
        ...filteredProducts.filter((product) => product.category !== focusCategory),
      ]
    : filteredProducts

  const visibleProducts = preferredProducts.slice(0, limit)

  const handleQuickAdd = (product: NormalizedProduct) => {
    if (product.stock <= 0) {
      return
    }

    addItem({
      id: `${product.id}-standard`,
      productId: product.dbId,
      name: product.name[locale as Locale],
      description: product.description[locale as Locale],
      price: product.sizes[0]?.price ?? product.price,
      image: product.image,
      stock: product.stock,
    })
  }

  if (!loading && visibleProducts.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <div className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        <h2 className="font-serif text-2xl text-foreground">{title ?? t.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle ?? t.subtitle}</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border bg-card p-6 text-sm text-muted-foreground">{t.loading}</div>
      ) : (
        <div
          className={`grid gap-4 ${
            mobileColumns === 2 ? "grid-cols-2" : "grid-cols-1"
          } ${compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}
        >
          {visibleProducts.map((product) => {
            const price = product.sizes[0]?.price ?? product.price

            return (
              <article key={product.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name[locale as Locale]}
                      fill
                      sizes={compact ? "(max-width: 640px) 50vw, 25vw" : "(max-width: 1024px) 50vw, 25vw"}
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-medium text-foreground">{product.name[locale as Locale]}</p>
                    <p className="mt-1 text-sm text-muted-foreground">DH {price.toFixed(2)}</p>
                  </div>
                  <div className={`flex gap-2 ${(compact || mobileColumns === 2) ? "flex-col" : "sm:flex-row"}`}>
                    <Link
                      href={`/product/${product.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      {t.viewProduct}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.stock <= 0}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {t.quickAdd}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
