"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
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
    backToShop: string
    products_one: string
    products_other: string
    notFound: string
    noProducts: string
  }
> = {
  en: {
    backToShop: "Back to Shop",
    products_one: "product",
    products_other: "products",
    notFound: "Category not found",
    noProducts: "No products are available in this category yet.",
  },
  fr: {
    backToShop: "Retour à la boutique",
    products_one: "produit",
    products_other: "produits",
    notFound: "Catégorie introuvable",
    noProducts: "Aucun produit n’est encore disponible dans cette catégorie.",
  },
  ar: {
    backToShop: "العودة إلى المتجر",
    products_one: "منتج",
    products_other: "منتجات",
    notFound: "التصنيف غير موجود",
    noProducts: "لا توجد منتجات في هذا التصنيف حتى الآن.",
  },
}

export default function CategoryPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const params = useParams()
  const slug = params.slug as string
  const { locale, isRTL } = useLanguage()
  const t = pageText[locale as Locale]
  const [category, setCategory] = useState<CategoryRecord | null>(null)
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true)

      const [categoryResult, productsResult] = await Promise.all([
        supabase
          .from("product_categories")
          .select("id, name, slug, description, active")
          .eq("slug", slug)
          .eq("active", true)
          .maybeSingle(),
        supabase.from("products").select("*").eq("category", slug).order("id", { ascending: false }),
      ])

      if (categoryResult.error || !categoryResult.data) {
        setCategory(null)
        setProducts([])
        setLoading(false)
        return
      }

      setCategory(categoryResult.data as CategoryRecord)
      setProducts(((productsResult.data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      setLoading(false)
    }

    void loadCategory()
  }, [slug, supabase])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const heroImage = products[0]?.image || products[0]?.images[0] || "/placeholder.svg"

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pb-20 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className={`mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ChevronLeft className="h-4 w-4" />
            {t.backToShop}
          </Link>

          {loading ? (
            <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !category ? (
            <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center">
              <h1 className="font-serif text-3xl text-foreground">{t.notFound}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{t.noProducts}</p>
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
                <div className="relative aspect-[16/7] min-h-[260px]">
                  <Image
                    src={heroImage}
                    alt={category.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-10 ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/80">Category</p>
                    <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">{category.name}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                      {category.description || t.noProducts}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-sm uppercase tracking-[0.24em] text-primary">Products</p>
                    <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
                      {products.length} {products.length === 1 ? t.products_one : t.products_other}
                    </h2>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="rounded-3xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                    {t.noProducts}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                    {products.map((product) => (
                      <CategoryProductCard key={product.id} product={product} locale={locale as Locale} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function CategoryProductCard({
  product,
  locale,
}: {
  product: NormalizedProduct
  locale: Locale
}) {
  const displayPrice = product.sizes[0]?.price ?? product.price

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <article className="overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name[locale]}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-2 p-4 sm:p-5">
          <h3 className="font-serif text-lg text-foreground sm:text-xl">{product.name[locale]}</h3>
          <p
            className="text-sm text-muted-foreground"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {product.description[locale]}
          </p>
          <p className="font-medium text-foreground">DH {displayPrice.toFixed(2)}</p>
        </div>
      </article>
    </Link>
  )
}
