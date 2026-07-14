"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Lock, MessageSquareMore, Plus, Save, Shield, Smartphone, Trash2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  DEFAULT_DELIVERY_METHODS,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  buildGoogleMapsLink,
  fetchSiteSettings,
  formatDhAmount,
  formatPhoneNumberForLink,
  isValidWhatsAppNumber,
  normalizeFreeShippingThreshold,
  type DeliveryMethod,
} from "@/lib/site-settings"

type MessageState = {
  type: "error" | "success"
  text: string
}

export function AdminSettingsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [adminEmail, setAdminEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactAddress, setContactAddress] = useState("")
  const [contactGoogleMapsUrl, setContactGoogleMapsUrl] = useState("")
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>(DEFAULT_DELIVERY_METHODS)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(DEFAULT_FREE_SHIPPING_THRESHOLD))
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [savingDeliveryMethods, setSavingDeliveryMethods] = useState(false)
  const [savingFreeShippingThreshold, setSavingFreeShippingThreshold] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<MessageState | null>(null)
  const [whatsappMessage, setWhatsappMessage] = useState<MessageState | null>(null)
  const [deliveryMessage, setDeliveryMessage] = useState<MessageState | null>(null)
  const [shippingMessage, setShippingMessage] = useState<MessageState | null>(null)
  const [activeDeliveryTab, setActiveDeliveryTab] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      setLoadingSettings(true)
      try {
        const [{ data: authData }, settings] = await Promise.all([supabase.auth.getUser(), fetchSiteSettings()])

        setAdminEmail(authData.user?.email ?? "")
        setWhatsappNumber(settings.whatsappNumber ?? "")
        setContactPhone(settings.contactPhone ?? "")
        setContactAddress(settings.contactAddress ?? "")
        setContactGoogleMapsUrl(settings.contactGoogleMapsUrl ?? "")
        setDeliveryMethods(settings.deliveryMethods?.length ? settings.deliveryMethods : DEFAULT_DELIVERY_METHODS)
        setFreeShippingThreshold(String(settings.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD))
      } catch {
        setAdminEmail("")
        setWhatsappNumber("")
        setContactPhone("")
        setContactAddress("")
        setContactGoogleMapsUrl("")
        setDeliveryMethods(DEFAULT_DELIVERY_METHODS)
        setFreeShippingThreshold(String(DEFAULT_FREE_SHIPPING_THRESHOLD))
      } finally {
        setLoadingSettings(false)
      }
    }

    void loadSettings()
  }, [supabase])

  useEffect(() => {
    if (deliveryMethods.length === 0) {
      setActiveDeliveryTab("")
      return
    }

    if (!deliveryMethods.some((method) => method.id === activeDeliveryTab)) {
      setActiveDeliveryTab(deliveryMethods[0].id)
    }
  }, [activeDeliveryTab, deliveryMethods])

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage(null)

    if (!adminEmail) {
      setPasswordMessage({ type: "error", text: "Sign in again to update the password." })
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Fill in the current password and the new password twice." })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Use a new password with at least 8 characters." })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "The new passwords do not match." })
      return
    }

    setChangingPassword(true)

    const signIn = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: currentPassword,
    })

    if (signIn.error) {
      setPasswordMessage({ type: "error", text: signIn.error.message })
      setChangingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordMessage({ type: "error", text: error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Your admin password has been updated." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    setChangingPassword(false)
  }

  const handleSaveWhatsapp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWhatsappMessage(null)

    if (!isValidWhatsAppNumber(whatsappNumber)) {
      setWhatsappMessage({
        type: "error",
        text: "Enter a WhatsApp number with the country code and 8 to 15 digits.",
      })
      return
    }

    setSavingWhatsapp(true)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ whatsappNumber }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string; whatsappNumber?: string }

      if (!response.ok) {
        setWhatsappMessage({
          type: "error",
          text: data.error ?? "Could not save the WhatsApp number.",
        })
      } else {
        setWhatsappNumber(data.whatsappNumber ?? whatsappNumber)
        setWhatsappMessage({
          type: "success",
          text: "The WhatsApp number has been saved and will be used for order links.",
        })
      }
    } catch (error) {
      setWhatsappMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save the WhatsApp number.",
      })
    } finally {
      setSavingWhatsapp(false)
    }
  }

  const handleSaveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWhatsappMessage(null)

    const payload = {
      contactPhone: contactPhone.trim(),
      contactAddress: contactAddress.trim(),
      contactGoogleMapsUrl: contactGoogleMapsUrl.trim(),
    }

    if (!payload.contactPhone || !payload.contactAddress) {
      setWhatsappMessage({ type: "error", text: "Provide a phone number and address before saving contact settings." })
      return
    }

    setSavingContact(true)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        contactPhone?: string
        contactAddress?: string
        contactGoogleMapsUrl?: string
      }

      if (!response.ok) {
        setWhatsappMessage({ type: "error", text: data.error ?? "Could not save contact settings." })
      } else {
        setContactPhone(data.contactPhone ?? formatPhoneNumberForLink(payload.contactPhone))
        setContactAddress(data.contactAddress ?? payload.contactAddress)
        setContactGoogleMapsUrl(
          data.contactGoogleMapsUrl ?? buildGoogleMapsLink(payload.contactGoogleMapsUrl, payload.contactAddress)
        )
        setWhatsappMessage({ type: "success", text: "Contact details have been saved." })
      }
    } catch (error) {
      setWhatsappMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save contact settings.",
      })
    } finally {
      setSavingContact(false)
    }
  }

  const handleSaveFreeShippingThreshold = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setShippingMessage(null)

    const threshold = normalizeFreeShippingThreshold(freeShippingThreshold)
    if (threshold === null) {
      setShippingMessage({
        type: "error",
        text: "Enter a valid free shipping threshold of 0 or more.",
      })
      return
    }

    setSavingFreeShippingThreshold(true)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ freeShippingThreshold: threshold }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        freeShippingThreshold?: number
      }

      if (!response.ok) {
        setShippingMessage({
          type: "error",
          text: data.error ?? "Could not save the free shipping threshold.",
        })
      } else {
        const nextThreshold = data.freeShippingThreshold ?? threshold
        setFreeShippingThreshold(String(nextThreshold))
        setShippingMessage({
          type: "success",
          text: "The free shipping threshold has been saved.",
        })
      }
    } catch (error) {
      setShippingMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save the free shipping threshold.",
      })
    } finally {
      setSavingFreeShippingThreshold(false)
    }
  }

  const addDeliveryMethod = () => {
    const nextMethodId = `delivery-${Date.now()}`
    setDeliveryMethods((current) => [
      ...current,
      {
        id: nextMethodId,
        name: "New delivery company",
        description: "",
        active: true,
        rates: [{ city: "", price: 0 }],
      },
    ])
    setActiveDeliveryTab(nextMethodId)
  }

  const updateDeliveryMethod = (index: number, field: keyof Pick<DeliveryMethod, "name" | "description" | "active">, value: string | boolean) => {
    setDeliveryMethods((current) =>
      current.map((method, methodIndex) =>
        methodIndex === index ? { ...method, [field]: value } : method
      )
    )
  }

  const addDeliveryRate = (methodIndex: number) => {
    setDeliveryMethods((current) =>
      current.map((method, index) =>
        index === methodIndex
          ? { ...method, rates: [...method.rates, { city: "", price: 0 }] }
          : method
      )
    )
  }

  const updateDeliveryRate = (
    methodIndex: number,
    rateIndex: number,
    field: "city" | "price",
    value: string
  ) => {
    setDeliveryMethods((current) =>
      current.map((method, index) =>
        index === methodIndex
          ? {
              ...method,
              rates: method.rates.map((rate, currentRateIndex) =>
                currentRateIndex === rateIndex
                  ? {
                      ...rate,
                      [field]: field === "price" ? Number(value) : value,
                    }
                  : rate
              ),
            }
          : method
      )
    )
  }

  const removeDeliveryRate = (methodIndex: number, rateIndex: number) => {
    setDeliveryMethods((current) =>
      current.map((method, index) =>
        index === methodIndex
          ? { ...method, rates: method.rates.filter((_, currentRateIndex) => currentRateIndex !== rateIndex) }
          : method
      )
    )
  }

  const removeDeliveryMethod = (index: number) => {
    setDeliveryMethods((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      if (current[index]?.id === activeDeliveryTab) {
        setActiveDeliveryTab(next[0]?.id ?? "")
      }
      return next
    })
  }

  const freeShippingThresholdValue = Number(freeShippingThreshold || DEFAULT_FREE_SHIPPING_THRESHOLD)

  const handleSaveDeliveryMethods = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDeliveryMessage(null)
    setSavingDeliveryMethods(true)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsappNumber: isValidWhatsAppNumber(whatsappNumber) ? whatsappNumber : undefined,
          deliveryMethods,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string; deliveryMethods?: DeliveryMethod[] }

      if (!response.ok) {
        setDeliveryMessage({
          type: "error",
          text: data.error ?? "Could not save delivery methods.",
        })
      } else {
        setDeliveryMethods(data.deliveryMethods ?? deliveryMethods)
        setDeliveryMessage({
          type: "success",
          text: "Les sociétés de livraison et leurs tarifs ont été enregistrés.",
        })
      }
    } catch (error) {
      setDeliveryMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save delivery methods.",
      })
    } finally {
      setSavingDeliveryMethods(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Admin settings</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep access secure and keep customer command links pointed at the right number.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Password updates use your current Supabase session, and the WhatsApp number is stored centrally so checkout, product pages, and admin flows stay in sync.
              </p>
            </div>

            <div className="grid gap-3">
              <SettingPill label="Compte" value={loadingSettings ? "Chargement..." : adminEmail || "Non connecté"} />
              <SettingPill label="WhatsApp" value={loadingSettings ? "Chargement..." : whatsappNumber || "Non défini"} />
              <SettingPill label="Téléphone" value={loadingSettings ? "Chargement..." : contactPhone || "Non défini"} />
              <SettingPill label="Adresse" value={loadingSettings ? "Chargement..." : contactAddress || "Non définie"} />
              <SettingPill
                label="Livraison gratuite"
                value={
                  loadingSettings
                    ? "Chargement..."
                    : freeShippingThresholdValue > 0
                      ? `${formatDhAmount(freeShippingThresholdValue)}+`
                      : "Gratuit"
                }
              />
              <SettingPill label="Accès" value="Admin uniquement" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Changer le mot de passe</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Saisissez à nouveau votre mot de passe actuel, puis choisissez-en un nouveau pour le compte admin.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">E-mail admin</span>
                <input value={adminEmail} readOnly className="admin-input bg-slate-50 text-slate-500" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Mot de passe actuel</span>
                <input
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="admin-input"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Nouveau mot de passe</span>
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  placeholder="Utilisez au moins 8 caractères"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirmer le nouveau mot de passe</span>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  placeholder="Répétez le nouveau mot de passe"
                />
              </label>

              <Button type="submit" className="w-full gap-2" disabled={changingPassword || !adminEmail}>
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {changingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>

              {passwordMessage ? (
                <Notice type={passwordMessage.type} text={passwordMessage.text} />
              ) : null}
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Seuil de livraison gratuite</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Le badge de la page d’accueil et les résumés d'administration utilisent cette valeur pour annoncer la livraison offerte.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveFreeShippingThreshold}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Montant minimum</span>
                <input
                  value={freeShippingThreshold}
                  onChange={(event) => setFreeShippingThreshold(event.target.value)}
                  className="admin-input"
                  placeholder="500"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                />
              </label>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                Les commandes au-dessus de ce montant affichent un message de livraison gratuite sur la page d’accueil.
              </div>

              <Button type="submit" className="w-full gap-2" disabled={savingFreeShippingThreshold}>
                {savingFreeShippingThreshold ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingFreeShippingThreshold ? "Enregistrement..." : "Enregistrer le seuil"}
              </Button>

              {shippingMessage ? <Notice type={shippingMessage.type} text={shippingMessage.text} /> : null}
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Numéro WhatsApp de commande</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ce numéro est utilisé lorsque les clients cliquent sur WhatsApp depuis les pages produit, la commande et le panier.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveWhatsapp}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Numéro WhatsApp</span>
                <input
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  className="admin-input"
                  placeholder="+212600000000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                Utilisez le format international complet avec l'indicatif du pays. L'application supprime les espaces et les symboles avant de créer le lien WhatsApp.
              </div>

              <Button type="submit" className="w-full gap-2" disabled={savingWhatsapp}>
                {savingWhatsapp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingWhatsapp ? "Enregistrement..." : "Enregistrer le numéro WhatsApp"}
              </Button>

              {whatsappMessage ? (
                <Notice type={whatsappMessage.type} text={whatsappMessage.text} />
              ) : null}
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Coordonnées publiques</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  These values are used by the contact page and public buttons. They can later be moved to a fully admin-managed settings table.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSaveContact}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Numéro de téléphone</span>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="admin-input"
                  placeholder="+212600000000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Adresse</span>
                <input
                  value={contactAddress}
                  onChange={(event) => setContactAddress(event.target.value)}
                  className="admin-input"
                  placeholder="Morocco"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Google Maps</span>
                <input
                  value={contactGoogleMapsUrl}
                  onChange={(event) => setContactGoogleMapsUrl(event.target.value)}
                  className="admin-input"
                  placeholder="https://www.google.com/maps/search/?api=1&query=Morocco"
                  autoComplete="url"
                />
              </label>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                Le lien Google Maps peut être une URL complète ou seulement une adresse. Le code produit un lien de secours si besoin.
              </div>

              <Button type="submit" className="w-full gap-2" disabled={savingContact}>
                {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingContact ? "Enregistrement..." : "Enregistrer les coordonnées"}
              </Button>

              {whatsappMessage ? <Notice type={whatsappMessage.type} text={whatsappMessage.text} /> : null}
            </form>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
                <h3 className="text-xl font-semibold text-slate-950">Sociétés de livraison et tarifs par ville</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ajoutez les services de livraison que vous utilisez, puis attribuez des prix par ville. La page de commande utilisera ces valeurs au lieu d'afficher la livraison gratuite.
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={addDeliveryMethod} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Ajouter une société</span>
              </Button>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSaveDeliveryMethods}>
            {deliveryMethods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Aucune société de livraison pour le moment. Ajoutez-en une pour commencer à définir les tarifs.
              </div>
            ) : null}

            {deliveryMethods.length > 0 ? (
              <Tabs value={activeDeliveryTab} onValueChange={setActiveDeliveryTab} className="space-y-5">
                <TabsList className="flex h-auto w-full flex-wrap gap-2 rounded-[1.25rem] bg-slate-100 p-2">
                  {deliveryMethods.map((method, methodIndex) => (
                    <TabsTrigger
                      key={method.id}
                      value={method.id}
                      className="min-w-[11rem] flex-none justify-between rounded-[1rem] px-4 py-3 text-left data-[state=active]:bg-white"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold">{method.name || `Société ${methodIndex + 1}`}</span>
                        <span className="text-xs text-slate-500">
                          {method.rates.length} city{method.rates.length === 1 ? "" : "ies"}
                        </span>
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {deliveryMethods.map((method, methodIndex) => (
                  <TabsContent key={method.id} value={method.id} className="mt-0">
                    <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid flex-1 gap-4 sm:grid-cols-2">
                          <label className="block space-y-2 sm:col-span-2">
                            <span className="text-sm font-medium text-slate-700">Nom de la société</span>
                            <input
                              value={method.name}
                              onChange={(event) => updateDeliveryMethod(methodIndex, "name", event.target.value)}
                              className="admin-input"
                              placeholder="Livraison Maroc"
                            />
                          </label>

                          <label className="block space-y-2 sm:col-span-2">
                            <span className="text-sm font-medium text-slate-700">Description</span>
                            <textarea
                              value={method.description}
                              onChange={(event) => updateDeliveryMethod(methodIndex, "description", event.target.value)}
                              className="admin-input min-h-24 resize-y"
                              placeholder="Courte note affichée lors de la commande"
                            />
                          </label>

                          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={method.active}
                              onChange={(event) => updateDeliveryMethod(methodIndex, "active", event.target.checked)}
                            />
                            Mode de livraison actif
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDeliveryMethod(methodIndex)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer la société
                        </button>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-950">Tarifs par ville</h4>
                            <p className="mt-1 text-xs text-slate-500">Ajoutez un prix par ville pour cette société de livraison.</p>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => addDeliveryRate(methodIndex)}>
                            Ajouter une ville
                          </Button>
                        </div>

                        {method.rates.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                            No city prices yet.
                          </div>
                        ) : null}

                        {method.rates.map((rate, rateIndex) => (
                          <div key={`${method.id}-${rateIndex}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_auto] md:items-end">
                            <label className="block space-y-2">
                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Ville</span>
                              <input
                                value={rate.city}
                                onChange={(event) => updateDeliveryRate(methodIndex, rateIndex, "city", event.target.value)}
                                className="admin-input"
                                placeholder="Ksar sghir"
                              />
                            </label>

                            <label className="block space-y-2">
                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Prix DH</span>
                              <input
                                value={String(rate.price)}
                                onChange={(event) => updateDeliveryRate(methodIndex, rateIndex, "price", event.target.value)}
                                type="number"
                                min="0"
                                step="0.01"
                                className="admin-input"
                                placeholder="45"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => removeDeliveryRate(methodIndex, rateIndex)}
                              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    </article>
                  </TabsContent>
                ))}
              </Tabs>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Les changements s'appliquent immédiatement au tunnel de commande après l'enregistrement.
              </p>
              <Button type="submit" className="gap-2" disabled={savingDeliveryMethods}>
                {savingDeliveryMethods ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingDeliveryMethods ? "Enregistrement..." : "Enregistrer la livraison"}
              </Button>
            </div>
          </form>

          {deliveryMessage ? (
            <div className="mt-4">
              <Notice type={deliveryMessage.type} text={deliveryMessage.text} />
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Utilisation</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Les boutons publics du site lisent le numéro enregistré à l'exécution, donc une seule modification ici met à jour tous les liens WhatsApp côté client sans redéploiement.
                </p>
              </div>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Live settings
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function SettingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function Notice({ type, text }: MessageState) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {text}
    </div>
  )
}
