  "use client"

  import { useEffect, useMemo, useState } from "react"
  import Image from "next/image"
  import Link from "next/link"
 import { ArrowLeft, Check, LogIn, ShoppingBag, UserPlus, ChevronDown } from "lucide-react"
  import { useCart } from "@/components/boty/cart-context"
  import { Header } from "@/components/boty/header"
  import { Footer } from "@/components/boty/footer"
  import { useAuth } from "@/components/boty/auth-context"
  import { useLanguage } from "@/components/language-context"
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { fetchSiteSettings } from "@/lib/site-settings"
  import { generateWhatsAppMessage, getWhatsAppMessageUrl } from "@/lib/whatsapp"
  import { saveBrowserStorefrontOrder, type StorefrontOrderRecord } from "@/lib/storefront-orders"
  import { YouMayLikeSection } from "@/components/boty/you-may-like-section"
  import { getSupabaseBrowserClient } from "@/lib/supabase"
  import type { Locale } from "@/i18n.config"

  const translations = {
    en: {
      title: "Checkout",
      subtitle: "Review your order and complete your purchase",
      emptyTitle: "Your cart is empty",
      emptyDescription: "Add some products before heading to checkout.",
      continueShopping: "Continue Shopping",
      backToShop: "Back to Shop",
      accountTitle: "Have an account?",
      accountPrompt: "Sign in to continue or create a new account with Google.",
      iHaveAccount: "I have an account",
      createAccount: "Create a new one",
      signInWithGoogle: "Continue with Google",
      continueAsGuest: "Continue as guest",
      shipping: "Shipping",
      free: "Calculated at checkout",
      total: "Total",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      phone: "Phone Number",
      address: "Delivery Address",
      city: "City",
      orderSummary: "Order Summary",
      placeOrder: "Place Order",
      sendViaWhatsApp: "Send via WhatsApp",
      required: "This field is required",
      processing: "Processing...",
      success: "Order placed successfully! We will contact you shortly.",
      totalItems: "items",
      item: "item",
      removeNotice: "You can still adjust your cart from the drawer.",
      whatsappNotice: "You'll be redirected to WhatsApp — please press Send to confirm your order."
    },
    fr: {
      title: "Paiement",
      subtitle: "Vérifiez votre commande et finalisez votre achat",
      emptyTitle: "Votre panier est vide",
      emptyDescription: "Ajoutez quelques produits avant d’aller au paiement.",
      continueShopping: "Continuer vos achats",
      backToShop: "Retour à la boutique",
      accountTitle: "Vous avez un compte ?",
      accountPrompt: "Connectez-vous pour continuer ou créez un nouveau compte avec Google.",
      iHaveAccount: "J’ai un compte",
      createAccount: "Créer un compte",
      signInWithGoogle: "Continuer avec Google",
      continueAsGuest: "Continuer en invité",
      shipping: "Livraison",
      free: "Calculé au paiement",
      total: "Total",
      personalInfo: "Informations personnelles",
      fullName: "Nom complet",
      phone: "Numéro de téléphone",
      address: "Adresse de livraison",
      city: "Ville",
      orderSummary: "Résumé de la commande",
      placeOrder: "Passer la commande",
      sendViaWhatsApp: "Envoyer via WhatsApp",
      required: "Ce champ est obligatoire",
      processing: "Traitement...",
      success: "Commande passée avec succès ! Nous vous contacterons bientôt.",
      totalItems: "articles",
      item: "article",
      removeNotice: "Vous pouvez encore ajuster votre panier depuis le tiroir.",
      totalLabel: "Total",
      whatsappNotice: "Vous serez redirigé vers WhatsApp — veuillez appuyer sur Envoyer pour confirmer votre commande."
    },
    ar: {
      title: "الدفع",
      subtitle: "راجع طلبك وأكمل عملية الشراء",
      emptyTitle: "سلتك فارغة",
      emptyDescription: "أضف بعض المنتجات قبل الانتقال إلى الدفع.",
      continueShopping: "متابعة التسوق",
      backToShop: "العودة إلى المتجر",
      accountTitle: "هل لديك حساب؟",
      accountPrompt: "سجّل الدخول للمتابعة أو أنشئ حسابًا جديدًا باستخدام Google.",
      iHaveAccount: "لدي حساب",
      createAccount: "إنشاء حساب جديد",
      signInWithGoogle: "المتابعة مع Google",
      continueAsGuest: "المتابعة كضيف",
      shipping: "التوصيل",
      free: "يُحسب عند الدفع",
      total: "الإجمالي",
      personalInfo: "المعلومات الشخصية",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      address: "عنوان التوصيل",
      city: "المدينة",
      orderSummary: "ملخص الطلب",
      placeOrder: "تقديم الطلب",
      sendViaWhatsApp: "إرسال عبر واتس آب",
      required: "هذا الحقل مطلوب",
      processing: "جارٍ المعالجة...",
      success: "تم تقديم الطلب بنجاح! سنتصل بك قريبًا.",
      totalItems: "عناصر",
      item: "عنصر",
      removeNotice: "لا يزال بإمكانك تعديل سلتك من الشريط الجانبي.",
      totalLabel: "الإجمالي",
      whatsappNotice: "سيتم تحويلك إلى واتساب — يرجى الضغط على إرسال لتأكيد طلبك."
    }
  } as const

  export default function CheckoutPage() {
    const supabase = useMemo(() => getSupabaseBrowserClient(), [])
    const { items, subtotal, clearCart } = useCart()
    const { user } = useAuth()
    const { locale, isRTL } = useLanguage()
    const t = translations[locale as Locale]
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [accountPromptOpen, setAccountPromptOpen] = useState(false)
    const [accountPromptMode, setAccountPromptMode] = useState<"existing" | "new" | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [whatsappNumber, setWhatsappNumber] = useState("")
    const [lastOrderReference, setLastOrderReference] = useState("")
    const [deliveryCities, setDeliveryCities] = useState<Array<{ city: string; price: number }>>([])
    const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      address: "",
      city: "",
    })
    const selectedDeliveryRate = useMemo(
      () => deliveryCities.find((rate) => rate.city.trim().toLowerCase() === formData.city.trim().toLowerCase()) ?? null,
      [deliveryCities, formData.city]
    )
    const shipping = selectedDeliveryRate ? selectedDeliveryRate.price : null
    const total = subtotal + (shipping ?? 0)
    const paymentMethod = "whatsapp" as const

    useEffect(() => {
      window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
      const loadSettings = async () => {
        const settings = await fetchSiteSettings()
        setWhatsappNumber(settings.whatsappNumber ?? "")
        const activeDeliveryMethod = settings.deliveryMethods?.find((method) => method.active) ?? null
        setDeliveryCities(activeDeliveryMethod?.rates ?? [])
      }

      void loadSettings()
    }, [])

    const openAccountPrompt = (mode: "existing" | "new") => {
      setAccountPromptMode(mode)
      setAccountPromptOpen(true)
    }

    const handleGoogleSignIn = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrors((current) => ({ ...current, submit: error.message }))
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }))
      }
    }

    const validateForm = () => {
      const nextErrors: Record<string, string> = {}
      if (!formData.fullName) nextErrors.fullName = t.required
      if (!formData.phone) nextErrors.phone = t.required
      if (!formData.address) nextErrors.address = t.required
      if (!formData.city) nextErrors.city = t.required
      if (!selectedDeliveryRate) nextErrors.city = t.required
      setErrors(nextErrors)
      return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return

      setIsSubmitting(true)
      setLastOrderReference("")
      setErrors((current) => ({ ...current, submit: "" }))

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
      try {
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
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              postalCode: "",
              country: "",
            },
            deliveryMethod: "WhatsApp",
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
          setErrors((current) => ({ ...current, submit: data.error ?? "Could not save the order." }))
          return
        }

        const savedOrder: StorefrontOrderRecord = {
          id: data.orderId ?? Date.now(),
          reference: data.reference ?? `WEB-${Date.now()}`,
          channel: data.channel ?? "checkout",
          paymentMethod: data.paymentMethod ?? paymentMethod,
          deliveryMethod: data.deliveryMethod ?? "WhatsApp",
          deliveryCity: data.deliveryCity ?? selectedDeliveryRate?.city ?? "",
          shipping: data.shipping ?? shipping ?? 0,
          status: data.status ?? "pending",
          subtotal: data.subtotal ?? subtotal,
          total: data.total ?? total,
          createdAt: data.createdAt ?? new Date().toISOString(),
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: "",
            country: "",
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

          clearCart()
        setIsSuccess(true)

        if (whatsappNumber) {
          const message = generateWhatsAppMessage(
            {
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              country: "",
              deliveryMethod: "WhatsApp",
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

          const whatsappUrl = getWhatsAppMessageUrl(message, whatsappNumber)

          // Show success screen first, then redirect to WhatsApp
          // (mobile browsers block window.open after an await, so we navigate the same tab)
          setTimeout(() => {
            window.location.href = whatsappUrl
          }, 1200)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save the order."
        setErrors((current) => ({ ...current, submit: message }))
      } finally {
        setIsSubmitting(false)
      }
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

              <div className="mt-12 text-left">
                <YouMayLikeSection limit={4} mobileColumns={2} />
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
               {user ? (
  <div className="mb-6 rounded-3xl border border-border/60 bg-muted/30 p-4">
    <p className="text-sm font-medium text-foreground">
      {locale === "fr" ? "Connecté en tant que" : locale === "ar" ? "متصل باسم" : "Signed in as"}{" "}
      <span className="font-normal text-muted-foreground">{user.email}</span>
    </p>
  </div>
) : (
  <div className="mb-6 rounded-3xl border border-border/60 bg-muted/30 p-4">
    <p className="text-sm font-medium text-foreground">{t.accountTitle}</p>
    <p className="mt-1 text-sm text-muted-foreground">{t.accountPrompt}</p>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => openAccountPrompt("existing")}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <LogIn className="h-4 w-4" />
        {t.iHaveAccount}
      </button>
      <button
        type="button"
        onClick={() => openAccountPrompt("new")}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        <UserPlus className="h-4 w-4" />
        {t.createAccount}
      </button>
    </div>
  </div>
)}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: "fullName", label: t.fullName, type: "text" },
                      { name: "phone", label: t.phone, type: "tel" },
                      { name: "address", label: t.address, type: "text" },
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

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.city}</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      list="delivery-city-suggestions"
                      placeholder={`${t.city}...`}
                      autoComplete="off"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                     <ChevronDown
      className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isRTL ? "left-3" : "right-3"}`}
    />
                    <datalist id="delivery-city-suggestions">
                      {deliveryCities.map((rate) => (
                        <option key={rate.city} value={rate.city} />
                      ))}
                    </datalist>
                    {errors.city ? <p className="mt-1 text-xs text-red-500">{errors.city}</p> : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? t.processing : t.sendViaWhatsApp}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">{t.whatsappNotice}</p>
                  {errors.submit ? <p className="text-sm text-red-500">{errors.submit}</p> : null}
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
                      <span>{selectedDeliveryRate ? `DH ${selectedDeliveryRate.price.toFixed(2)}` : t.free}</span>
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

            <div className="mt-12">
              <YouMayLikeSection
                excludeProductIds={items.map((item) => item.productId ?? item.id)}
                limit={4}
                mobileColumns={2}
              />
            </div>
          </div>
        </div>
        <Footer />

        <Dialog open={accountPromptOpen} onOpenChange={setAccountPromptOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{accountPromptMode === "new" ? t.createAccount : t.accountTitle}</DialogTitle>
              <DialogDescription>{t.accountPrompt}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" />
                {t.signInWithGoogle}
              </button>
              <button
                type="button"
                onClick={() => setAccountPromptOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {t.continueAsGuest}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    )
  }
