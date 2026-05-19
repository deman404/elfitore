"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useCart } from "./cart-context"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

const sectionText: Record<Locale, { eyebrow: string; title: string; description: string; quickAdd: string }> = {
  en: {
    eyebrow: "Best Sellers",
    title: "Popular picks customers keep coming back for",
    description: "Swipe on mobile to browse the next product or view the full set on desktop.",
    quickAdd: "Add to cart",
  },
  fr: {
    eyebrow: "Meilleures ventes",
    title: "Les produits les plus appréciés par nos clients",
    description: "Faites glisser sur mobile pour voir le produit suivant ou consultez l’ensemble sur ordinateur.",
    quickAdd: "Ajouter au panier",
  },
  ar: {
    eyebrow: "الأكثر مبيعًا",
    title: "الاختيارات الأكثر طلبًا لدى عملائنا",
    description: "اسحب على الهاتف لعرض المنتج التالي أو شاهد المجموعة الكاملة على الكمبيوتر.",
    quickAdd: "أضف إلى السلة",
  },
}

function FeaturedProductCard({
  product,
  onQuickAdd,
}: {
  product: NormalizedProduct
  onQuickAdd: (product: NormalizedProduct) => void
}) {
  const { locale, isRTL } = useLanguage()

  const displayPrice = product.sizes[0]?.price ?? product.price

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-background shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name[locale as Locale]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 86vw"
            className="object-cover"
          />
          <span
            className={`absolute top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur-sm ${
              isRTL ? "right-4" : "left-4"
            }`}
          >
            {displayPrice ? `DH ${displayPrice}` : "DH 0"}
          </span>
        </div>
      </Link>

      <div className={`space-y-3 p-4 sm:p-5 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="min-w-0">
          <h3 className="font-serif text-lg text-foreground sm:text-xl">{product.name[locale as Locale]}</h3>
          <p
            className="mt-2 text-sm text-muted-foreground"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {product.description[locale as Locale]}
          </p>
        </div>

        <div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div>
            <p className="text-sm text-muted-foreground">
              {product.sizes.length > 0 ? product.sizes[0].label : "Standard"}
            </p>
            <p className="font-medium text-foreground">DH {displayPrice.toFixed(2)}</p>
          </div>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onQuickAdd(product)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={sectionText[locale as Locale].quickAdd}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{sectionText[locale as Locale].quickAdd}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export function BestSellerSection() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { locale, isRTL } = useLanguage()
  const { addItem } = useCart()
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const t = sectionText[locale as Locale]
  const featuredProducts = products.slice(0, 4)

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleQuickAdd = (product: NormalizedProduct) => {
    if (product.stock <= 0) {
      return
    }

    addItem({
      id: `${product.id}-best-seller`,
      productId: product.dbId,
      name: product.name[locale as Locale],
      description: product.description[locale as Locale],
      price: product.sizes[0]?.price ?? product.price,
      image: product.image,
      stock: product.stock,
    })
  }

  if (!loading && featuredProducts.length === 0) {
    return null
  }

  return (
    <section ref={sectionRef} className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 sm:mb-10 ${isRTL ? "text-right" : "text-left"}`}>
          <span
            className={`mb-3 block text-xs uppercase tracking-[0.28em] text-primary sm:text-sm ${
              isVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={isVisible ? { animationDelay: "0.1s", animationFillMode: "forwards" } : {}}
          >
            {t.eyebrow}
          </span>
          <h2
            className={`max-w-2xl font-serif text-3xl text-foreground sm:text-4xl lg:text-5xl ${
              isVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={isVisible ? { animationDelay: "0.2s", animationFillMode: "forwards" } : {}}
          >
            {t.title}
          </h2>
          <p
            className={`mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base ${
              isVisible ? "animate-blur-in opacity-0" : "opacity-0"
            }`}
            style={isVisible ? { animationDelay: "0.3s", animationFillMode: "forwards" } : {}}
          >
            {t.description}
          </p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-card">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="lg:hidden">
              <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
                <CarouselContent>
                  {featuredProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-[86%] sm:basis-1/2">
                      <FeaturedProductCard product={product} onQuickAdd={handleQuickAdd} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className={`${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
                  <FeaturedProductCard product={product} onQuickAdd={handleQuickAdd} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
