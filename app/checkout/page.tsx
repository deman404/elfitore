"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/boty/cart-context"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { fetchSiteSettings } from "@/lib/site-settings"
import { generateWhatsAppMessage, getWhatsAppMessageUrl } from "@/lib/whatsapp"
import { saveBrowserStorefrontOrder, type StorefrontOrderRecord } from "@/lib/storefront-orders"
import type { DeliveryMethod } from "@/lib/site-settings"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    title: "Checkout",
    subtitle: "Review your order and complete your purchase",
    emptyTitle: "Your cart is empty",
    emptyDescription: "Add some products before heading to checkout.",
    continueShopping: "Continue Shopping",
    backToShop: "Back to Shop",
    shipping: "Shipping",
    free: "Calculated at checkout",
    total: "Total",
    deliveryMethod: "Delivery method",
    deliveryCity: "Delivery city",
    selectDeliveryMethod: "Select delivery method",
    selectDeliveryCity: "Select city",
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery (COD)",
    whatsapp: "WhatsApp",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone Number",
    address: "Delivery Address",
    city: "City",
    postalCode: "Postal Code",
    country: "Country",
    orderSummary: "Order Summary",
    placeOrder: "Place Order",
    sendViaWhatsApp: "Send via WhatsApp",
    required: "This field is required",
    processing: "Processing...",
    success: "Order placed successfully! We will contact you shortly.",
    totalItems: "items",
    item: "item",
    removeNotice: "You can still adjust your cart from the drawer."
  },
  fr: {
    title: "Paiement",
    subtitle: "Vérifiez votre commande et finalisez votre achat",
    emptyTitle: "Votre panier est vide",
    emptyDescription: "Ajoutez quelques produits avant d’aller au paiement.",
    continueShopping: "Continuer vos achats",
    backToShop: "Retour à la boutique",
    shipping: "Livraison",
    free: "Calculé au paiement",
    total: "Total",
    deliveryMethod: "Mode de livraison",
    deliveryCity: "Ville de livraison",
    selectDeliveryMethod: "Choisir le mode de livraison",
    selectDeliveryCity: "Choisir une ville",
    paymentMethod: "Mode de paiement",
    cod: "Paiement à la livraison",
    whatsapp: "WhatsApp",
    personalInfo: "Informations personnelles",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Numéro de téléphone",
    address: "Adresse de livraison",
    city: "Ville",
    postalCode: "Code postal",
    country: "Pays",
    orderSummary: "Résumé de la commande",
    placeOrder: "Passer la commande",
    sendViaWhatsApp: "Envoyer via WhatsApp",
    required: "Ce champ est obligatoire",
    processing: "Traitement...",
    success: "Commande passée avec succès ! Nous vous contacterons bientôt.",
    totalItems: "articles",
    item: "article",
    removeNotice: "Vous pouvez encore ajuster votre panier depuis le tiroir.",
    totalLabel: "Total"
  },
  ar: {
    title: "الدفع",
    subtitle: "راجع طلبك وأكمل عملية الشراء",
    emptyTitle: "سلتك فارغة",
    emptyDescription: "أضف بعض المنتجات قبل الانتقال إلى الدفع.",
    continueShopping: "متابعة التسوق",
    backToShop: "العودة إلى المتجر",
    shipping: "التوصيل",
    free: "يُحسب عند الدفع",
    total: "الإجمالي",
    deliveryMethod: "طريقة التوصيل",
    deliveryCity: "مدينة التوصيل",
    selectDeliveryMethod: "اختر طريقة التوصيل",
    selectDeliveryCity: "اختر مدينة",
    paymentMethod: "طريقة الدفع",
    cod: "الدفع عند الاستلام",
    whatsapp: "واتس آب",
    personalInfo: "المعلومات الشخصية",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "عنوان التوصيل",
    city: "المدينة",
    postalCode: "الرمز البريدي",
    country: "الدولة",
    orderSummary: "ملخص الطلب",
    placeOrder: "تقديم الطلب",
    sendViaWhatsApp: "إرسال عبر واتس آب",
    required: "هذا الحقل مطلوب",
    processing: "جارٍ المعالجة...",
    success: "تم تقديم الطلب بنجاح! سنتصل بك قريبًا.",
    totalItems: "عناصر",
    item: "عنصر",
    removeNotice: "لا يزال بإمكانك تعديل سلتك من الشريط الجانبي.",
    totalLabel: "الإجمالي"
  }
} as const

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [deliveryMethodId, setDeliveryMethodId] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "whatsapp">("cod")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [lastOrderReference, setLastOrderReference] = useState("")
  const activeDeliveryMethods = useMemo(
    () => deliveryMethods.filter((method) => method.active),
    [deliveryMethods]
  )
  const selectedDeliveryMethod = useMemo(
    () => activeDeliveryMethods.find((method) => method.id === deliveryMethodId) ?? activeDeliveryMethods[0] ?? null,
    [activeDeliveryMethods, deliveryMethodId]
  )
  const deliveryCities = selectedDeliveryMethod?.rates ?? []
  const selectedDeliveryRate = deliveryCities.find((rate) => rate.city === deliveryCity) ?? deliveryCities[0] ?? null
  const shipping = selectedDeliveryRate ? selectedDeliveryRate.price : null
  const total = subtotal + (shipping ?? 0)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      setWhatsappNumber(settings.whatsappNumber ?? "")
      setDeliveryMethods(settings.deliveryMethods ?? [])
    }

    void loadSettings()
  }, [])

  useEffect(() => {
    if (!activeDeliveryMethods.length) return

    const nextMethod = activeDeliveryMethods.find((method) => method.id === deliveryMethodId) ?? activeDeliveryMethods[0]
    if (nextMethod.id !== deliveryMethodId) {
      setDeliveryMethodId(nextMethod.id)
    }
  }, [activeDeliveryMethods, deliveryMethodId])

  useEffect(() => {
    if (!selectedDeliveryMethod) return

    const nextCity = selectedDeliveryMethod.rates[0]?.city ?? ""
    if (nextCity && nextCity !== deliveryCity) {
      setDeliveryCity(nextCity)
      setFormData((current) => ({ ...current, city: nextCity }))
      return
    }

    if (!nextCity && deliveryCity) {
      setDeliveryCity("")
      setFormData((current) => ({ ...current, city: "" }))
    }
  }, [deliveryCity, selectedDeliveryMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.fullName) nextErrors.fullName = t.required
    if (!formData.email) nextErrors.email = t.required
    if (!formData.phone) nextErrors.phone = t.required
    if (!formData.address) nextErrors.address = t.required
    if (!formData.city) nextErrors.city = t.required
    if (!formData.country) nextErrors.country = t.required
    if (!selectedDeliveryMethod) nextErrors.deliveryMethod = t.required
    if (!selectedDeliveryRate) nextErrors.deliveryCity = t.required
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setLastOrderReference("")

    const orderItems = items.map((item) => ({
      productId: item.productId ?? (() => {
        const parsed = Number.parseInt(item.id.split("-")[0] ?? "", 10)
        return Number.isFinite(parsed) ? parsed : undefined
      })(),
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      image: item.image,
    }))

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "checkout",
        paymentMethod,
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        deliveryMethod: selectedDeliveryMethod?.name ?? "",
        deliveryCity: selectedDeliveryRate?.city ?? "",
        shipping: shipping ?? 0,
        items: orderItems,
      }),
    })

    const data = (await response.json().catch(() => ({}))) as {
      error?: string
      orderId?: number
      reference?: string
      subtotal?: number
      total?: number
      createdAt?: string
      status?: string
      channel?: "checkout" | "product-page"
      paymentMethod?: "cod" | "whatsapp"
      deliveryMethod?: string
      deliveryCity?: string
      shipping?: number
    }

    if (!response.ok) {
      setErrors((current) => ({ ...current, paymentMethod: data.error ?? "Could not save the order." }))
      setIsSubmitting(false)
      return
    }

    const savedOrder: StorefrontOrderRecord = {
      id: data.orderId ?? Date.now(),
      reference: data.reference ?? `WEB-${Date.now()}`,
      channel: data.channel ?? "checkout",
      paymentMethod: data.paymentMethod ?? paymentMethod,
      deliveryMethod: data.deliveryMethod ?? selectedDeliveryMethod?.name ?? "",
      deliveryCity: data.deliveryCity ?? selectedDeliveryRate?.city ?? "",
      shipping: data.shipping ?? shipping ?? 0,
      status: data.status ?? "pending",
      subtotal: data.subtotal ?? subtotal,
      total: data.total ?? total,
      createdAt: data.createdAt ?? new Date().toISOString(),
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      items: orderItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? 0,
        image: item.image,
      })),
    }

    saveBrowserStorefrontOrder(savedOrder)
    setLastOrderReference(savedOrder.reference)

    if (paymentMethod === "whatsapp") {
      if (!whatsappNumber) {
        clearCart()
        setIsSuccess(true)
        setIsSubmitting(false)
        return
      }

      const message = generateWhatsAppMessage(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          deliveryMethod: selectedDeliveryMethod?.name,
          deliveryCity: selectedDeliveryRate?.city,
          shipping: shipping ?? undefined,
          items: orderItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice ?? 0,
          })),
          total,
        },
        locale as Locale
      )

      window.open(getWhatsAppMessageUrl(message, whatsappNumber), "_blank")
    }

    clearCart()
    setIsSuccess(true)
    setIsSubmitting(false)
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{t.emptyTitle}</h1>
            <p className="text-lg text-muted-foreground mb-8">{t.emptyDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.continueShopping}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {t.backToShop}
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-4xl text-foreground mb-4">{t.success}</h1>
              <p className="text-muted-foreground mb-8">{t.removeNotice}</p>
              {lastOrderReference ? (
                <p className="mb-8 text-sm font-medium text-foreground">
                  Order reference: {lastOrderReference}
                </p>
              ) : null}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {t.continueShopping}
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className={`mb-10 ${isRTL ? "text-right" : "text-left"}`}>
            <Link href="/shop" className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <ArrowLeft className="h-4 w-4" />
              {t.backToShop}
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{t.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{t.subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <section className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-2xl text-foreground mb-6">{t.personalInfo}</h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4">{t.deliveryMethod}</h3>
                  <div className="space-y-3">
                    <select
                      value={deliveryMethodId}
                      onChange={(event) => setDeliveryMethodId(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {activeDeliveryMethods.length === 0 ? (
                        <option value="">{t.selectDeliveryMethod}</option>
                      ) : null}
                      {activeDeliveryMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                    {selectedDeliveryMethod?.description ? (
                      <p className="text-sm text-muted-foreground">{selectedDeliveryMethod.description}</p>
                    ) : null}
                  </div>
                  {errors.deliveryMethod ? <p className="mt-3 text-sm text-red-600">{errors.deliveryMethod}</p> : null}
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t.deliveryCity}</h3>
                  <select
                    value={deliveryCity}
                    onChange={(event) => {
                      const nextCity = event.target.value
                      setDeliveryCity(nextCity)
                      setFormData((current) => ({ ...current, city: nextCity }))
                    }}
                    disabled={deliveryCities.length === 0}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deliveryCities.length === 0 ? (
                      <option value="">{t.selectDeliveryCity}</option>
                    ) : null}
                    {deliveryCities.map((rate) => (
                      <option key={rate.city} value={rate.city}>
                        {rate.city} - DH {rate.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {errors.deliveryCity ? <p className="mt-3 text-sm text-red-600">{errors.deliveryCity}</p> : null}
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t.paymentMethod}</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                        className="accent-primary"
                      />
                      <span className="font-medium">{t.cod}</span>
                    </label>
                    <label className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition hover:bg-muted/50 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={paymentMethod === "whatsapp"}
                        onChange={(e) => setPaymentMethod(e.target.value as "whatsapp")}
                        className="accent-primary"
                      />
                      <span className="font-medium">{t.whatsapp}</span>
                    </label>
                  </div>
                  {errors.paymentMethod ? (
                    <p className="mt-3 text-sm text-red-600">{errors.paymentMethod}</p>
                  ) : null}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: "fullName", label: t.fullName, type: "text" },
                    { name: "email", label: t.email, type: "email" },
                    { name: "phone", label: t.phone, type: "tel" },
                    { name: "address", label: t.address, type: "text" },
                    { name: "postalCode", label: t.postalCode, type: "text" },
                    { name: "country", label: t.country, type: "text" },
                  ].map(field => (
                    <div key={field.name} className={field.name === "address" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-medium mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 ${errors[field.name] ? "border-red-500" : "border-border"}`}
                      />
                      {errors[field.name] && <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? t.processing : (paymentMethod === "cod" ? t.placeOrder : t.sendViaWhatsApp)}
                </button>
              </form>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-foreground mb-6">{t.orderSummary}</h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-start gap-4 text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} {item.quantity === 1 ? t.item : t.totalItems}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium text-foreground">DH {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-border/50 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t.shipping}</span>
                    <span>{shipping === null ? t.selectDeliveryCity : `DH ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-medium text-foreground">
                    <span>{t.total}</span>
                    <span>DH {total.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border bg-muted/30 p-6">
                <h3 className="font-medium text-foreground mb-2">{t.backToShop}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.removeNotice}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
