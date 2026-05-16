"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-context"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

const headerText: Record<Locale, { collection: string; title: string; description: string }> = {
  en: {
    collection: "Our Collection",
    title: "Premium Moroccan Selection",
    description: "Handpicked olive oils and premium olives from the finest Moroccan groves",
  },
  fr: {
    collection: "Notre Collection",
    title: "Sélection Marocaine Premium",
    description: "Huiles d'olive et olives premium soigneusement sélectionnées des plus beaux vergers marocains",
  },
  ar: {
    collection: "مجموعتنا",
    title: "التشكيلة المغربية الممتازة",
    description: "زيوت زيتون وزيتون فاخر مختارة بعناية من أفضل بساتين المغرب",
  },
}

const viewAllText: Record<Locale, string> = {
  en: "View All Products",
  fr: "Voir tous les produits",
  ar: "عرض جميع المنتجات",
}

export function ProductGrid() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [isVisible, setIsVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const { locale, isRTL } = useLanguage()
  const header = headerText[locale as Locale]
  const visibleProducts = products.slice(0, 4)

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true)
      setError("")

      const productsResult = await supabase.from("products").select("*").order("id", { ascending: false })

      if (productsResult.error) {
        setProducts([])
        setError(`Could not load products: ${productsResult.error.message}`)
      } else {
        setProducts(((productsResult.data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      }

      setLoading(false)
    }

    void loadCatalog()
  }, [supabase])

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      gridObserver.disconnect()
      headerObserver.disconnect()
    }
  }, [])

  return (
    <section className="bg-card py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className={`mb-16 text-center ${isRTL ? "rtl" : "ltr"}`}>
          <span
            className={`mb-4 block text-xs uppercase tracking-[0.3em] text-primary sm:text-sm ${
              headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={headerVisible ? { animationDelay: "0.2s", animationFillMode: "forwards" } : {}}
          >
            {header.collection}
          </span>
          <h2
            className={`mb-4 text-balance font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-7xl ${
              headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={headerVisible ? { animationDelay: "0.4s", animationFillMode: "forwards" } : {}}
          >
            {header.title}
          </h2>
          <p
            className={`mx-auto max-w-md text-sm text-muted-foreground sm:text-base lg:text-lg ${
              headerVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={headerVisible ? { animationDelay: "0.6s", animationFillMode: "forwards" } : {}}
          >
            {header.description}
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-background p-4 shadow-sm">
                <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ))
          ) : visibleProducts.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-background p-8 text-center text-sm text-muted-foreground">
              No products available from Supabase yet.
            </div>
          ) : (
            visibleProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={`group transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="overflow-hidden rounded-3xl bg-background boty-shadow boty-transition group-hover:scale-[1.02]">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name[locale as Locale]}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover boty-transition group-hover:scale-105"
                    />
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"} flex h-10 w-10 items-center justify-center rounded-full bg-background/90 opacity-0 translate-y-2 backdrop-blur-sm boty-shadow boty-transition group-hover:opacity-100 group-hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (product.stock <= 0) return
                        addItem({
                          id: product.id,
                          productId: product.dbId,
                          name: product.name[locale as Locale],
                          description: product.description[locale as Locale],
                          price: product.price,
                          image: product.image,
                          stock: product.stock,
                        })
                      }}
                      aria-label={
                        locale === "fr" ? "Ajouter au panier" : locale === "ar" ? "أضف إلى السلة" : "Add to cart"
                      }
                    >
                      <ShoppingBag className="h-4 w-4 text-foreground" />
                    </button>
                  </div>

                  <div className={`p-5 ${isRTL ? "text-right" : "text-left"}`}>
                    <h3 className="mb-1 font-serif text-lg text-foreground">{product.name[locale as Locale]}</h3>
                    <p
                      className="mb-3 text-sm text-muted-foreground"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      {product.description[locale as Locale]}
                    </p>
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="font-medium text-foreground">DH {product.price}</span>
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
            ))
          )}
        </div>

        <div className="mt-10 text-center sm:mt-12">
          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/20 bg-transparent px-8 py-4 text-sm tracking-wide text-foreground boty-transition hover:bg-foreground/5 sm:w-auto"
          >
            {viewAllText[locale as Locale]}
          </Link>
        </div>
      </div>
    </section>
  )
}
