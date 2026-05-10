"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ShoppingBag } from "lucide-react"
import { useParams } from "next/navigation"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { fetchSiteSettings } from "@/lib/site-settings"
import { generateWhatsAppMessage, getWhatsAppChatUrl, getWhatsAppMessageUrl } from "@/lib/whatsapp"
import { saveBrowserStorefrontOrder, type StorefrontOrderRecord } from "@/lib/storefront-orders"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    backToShop: "Back to Shop",
    size: "Size",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    orderViaWhatsApp: "Order via WhatsApp",
    contactViaWhatsApp: "Contact via WhatsApp",
    loading: "Loading product...",
    notFound: "Product not found",
    noProducts: "No product data is available from Supabase yet.",
  },
  fr: {
    backToShop: "Retour à la boutique",
    size: "Taille",
    quantity: "Quantité",
    addToCart: "Ajouter au panier",
    orderViaWhatsApp: "Commander via WhatsApp",
    contactViaWhatsApp: "Contacter via WhatsApp",
    loading: "Chargement du produit...",
    notFound: "Produit introuvable",
    noProducts: "Aucune donnée produit n’est encore disponible dans Supabase.",
  },
  ar: {
    backToShop: "العودة إلى المتجر",
    size: "الحجم",
    quantity: "الكمية",
    addToCart: "إضافة إلى السلة",
    orderViaWhatsApp: "اطلب عبر واتس آب",
    contactViaWhatsApp: "تواصل عبر واتس آب",
    loading: "جاري تحميل المنتج...",
    notFound: "المنتج غير موجود",
    noProducts: "لا توجد بيانات للمنتج في Supabase حتى الآن.",
  },
} as const

type ProductState = {
  normalized: NormalizedProduct | null
}

export default function ProductPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const params = useParams()
  const productId = params.id as string
  const { locale, isRTL } = useLanguage()
  const { addItem } = useCart()
  const t = translations[locale as Locale]
  const [productState, setProductState] = useState<ProductState>({ normalized: null })
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)

      const productIdNumber = Number(productId)
      const query = Number.isNaN(productIdNumber)
        ? supabase.from("products").select("*").eq("id", productId)
        : supabase.from("products").select("*").eq("id", productIdNumber)

      const { data, error } = await query.single()

      if (error || !data) {
        setProductState({ normalized: null })
        setLoading(false)
        return
      }

      const raw = data as CatalogProductRow
      const normalized = normalizeProductRow(raw)
      setProductState({ normalized })
      setSelectedSize(normalized.sizes[0]?.label ?? "")
      setSelectedImage(normalized.images[0] ?? normalized.image)
      setQuantity(normalized.stock > 0 ? 1 : 0)
      setLoading(false)
    }

    void loadProduct()
  }, [productId, supabase])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      setWhatsappNumber(settings.whatsappNumber ?? "")
    }

    void loadSettings()
  }, [])

  const product = productState.normalized

  const activeSize = product?.sizes.find((size) => size.label === selectedSize) ?? product?.sizes[0]
  const unitPrice = activeSize?.price ?? product?.price ?? 0
  const totalPrice = unitPrice * quantity
  const availableStock = product?.stock ?? 0

  const handleAddToCart = () => {
    if (!product) return

    Array.from({ length: quantity }).forEach(() => {
      addItem({
        id: `${product.id}-${selectedSize || "standard"}`,
        productId: product.dbId,
        name: product.name[locale as Locale],
        description: `${product.description[locale as Locale]}${selectedSize ? ` • ${selectedSize}` : ""}`,
        price: unitPrice,
        image: selectedImage || product.image,
        stock: availableStock,
      })
    })
  }

  const handleOrderViaWhatsApp = () => {
    if (!product || !whatsappNumber) return

    const orderItems = [
      {
        productId: product.dbId,
        productName: product.name[locale as Locale],
        quantity,
        unitPrice: unitPrice,
        image: selectedImage || product.image,
      },
    ]

    const savedOrder: StorefrontOrderRecord = {
      id: Date.now(),
      reference: `WEB-${Date.now()}`,
      channel: "product-page",
      paymentMethod: "whatsapp",
      deliveryMethod: "",
      deliveryCity: "",
      shipping: 0,
      status: "pending",
      subtotal: totalPrice,
      total: totalPrice,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
      },
      items: orderItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        image: item.image,
      })),
    }

    saveBrowserStorefrontOrder(savedOrder)

    const message = generateWhatsAppMessage(
      {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        items: orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
        total: totalPrice,
      },
      locale as Locale
    )

    window.open(getWhatsAppMessageUrl(message, whatsappNumber), "_blank")
  }

  const handleContactViaWhatsApp = () => {
    if (!whatsappNumber) {
      return
    }

    window.open(getWhatsAppChatUrl(whatsappNumber), "_blank")
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-card p-8 text-center shadow-sm">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="font-serif text-4xl text-foreground">{t.notFound}</h1>
            <p className="mt-4 text-muted-foreground">{t.noProducts}</p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {t.backToShop}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const productImages = product.images.length > 0 ? product.images : [product.image]

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

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-card boty-shadow">
                <Image
                  src={selectedImage || product.image || "/placeholder.svg"}
                  alt={product.name[locale as Locale]}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              {productImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                        selectedImage === image ? "border-primary ring-2 ring-primary/20" : "border-border"
                      }`}
                    >
                      <Image src={image} alt={product.name[locale as Locale]} fill sizes="25vw" className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={`space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary">
                  {product.category.replace(/-/g, " ")}
                </p>
                <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
                  {product.name[locale as Locale]}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {product.description[locale as Locale]}
                </p>
              </div>

              <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.size}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.sizes.length > 0 ? (
                        product.sizes.map((size) => (
                          <button
                            key={size.label}
                            type="button"
                            onClick={() => setSelectedSize(size.label)}
                            className={`rounded-full px-4 py-2 text-sm transition ${
                              selectedSize === size.label
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-foreground/70 hover:text-foreground boty-shadow"
                            }`}
                          >
                            {size.label}
                          </button>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Standard</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t.quantity}</p>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-background px-4 py-2 boty-shadow">
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        className="text-lg"
                        disabled={availableStock <= 0}
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.min(availableStock, value + 1))}
                        className="text-lg"
                        disabled={availableStock <= 0 || quantity >= availableStock}
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {availableStock <= 0 ? "Out of stock" : `${availableStock} available`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-semibold text-foreground">DH {totalPrice}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t.addToCart}
                </button>
                <button
                  type="button"
                  onClick={handleOrderViaWhatsApp}
                  disabled={!whatsappNumber || availableStock <= 0}
                  className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.orderViaWhatsApp}
                </button>
                <button
                  type="button"
                  onClick={handleContactViaWhatsApp}
                  disabled={!whatsappNumber || availableStock <= 0}
                  className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.contactViaWhatsApp}
                </button>
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm ${availableStock <= 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                {availableStock <= 0 ? "This product is currently out of stock." : `${availableStock} units available.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
