import { MOROCCO_DELIVERY_RATES } from "@/lib/morocco-delivery-tariffs"

export const SITE_SETTING_WHATSAPP_NUMBER_KEY = "whatsapp_number"
export const SITE_SETTING_CONTACT_PHONE_KEY = "contact_phone"
export const SITE_SETTING_CONTACT_ADDRESS_KEY = "contact_address"
export const SITE_SETTING_CONTACT_GOOGLE_MAPS_URL_KEY = "contact_google_maps_url"
export const SITE_SETTING_DELIVERY_METHODS_KEY = "delivery_methods"
export const SITE_SETTING_FREE_SHIPPING_THRESHOLD_KEY = "free_shipping_threshold"
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 500
export const DEFAULT_CONTACT_PHONE = "+212 674-722163"
export const DEFAULT_CONTACT_WHATSAPP_NUMBER = "+212 674-722163"
export const DEFAULT_CONTACT_ADDRESS = "Morocco"
export const DEFAULT_CONTACT_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/7qxtBCQ6keWyot4K7"

export type DeliveryRate = {
  city: string
  price: number
}

export type DeliveryMethod = {
  id: string
  name: string
  description: string
  active: boolean
  rates: DeliveryRate[]
}

export type SiteSettingsResponse = {
  whatsappNumber: string
  contactPhone: string
  contactAddress: string
  contactGoogleMapsUrl: string
  deliveryMethods: DeliveryMethod[]
  freeShippingThreshold: number
}

export function normalizeWhatsAppNumber(value: string) {
  return value.trim()
}

export function formatWhatsAppNumberForLink(value: string) {
  return value.replace(/[^\d]/g, "")
}

export function formatPhoneNumberForLink(value: string) {
  return value.replace(/[^\d+]/g, "")
}

export function buildGoogleMapsLink(value: string, fallbackAddress = DEFAULT_CONTACT_ADDRESS) {
  const raw = value.trim()

  if (raw && /^https?:\/\//i.test(raw)) {
    return raw
  }

  const query = raw || fallbackAddress
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function isValidWhatsAppNumber(value: string) {
  const digitsOnly = formatWhatsAppNumberForLink(value)
  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

export function normalizeFreeShippingThreshold(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return null
  }

  const numericValue = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null
  }

  return Math.round(numericValue)
}

export function formatDhAmount(value: number) {
  return `DH ${value.toLocaleString("en-US")}`
}

function normalizeCityKey(value: string) {
  return value.trim().toLowerCase()
}

function buildDefaultDeliveryRates() {
  const manualRates: DeliveryRate[] = [
    { city: "Ksar sghir", price: 45 },
    { city: "Azilal", price: 45 },
    { city: "Demnate", price: 45 },
  ]
  const merged: DeliveryRate[] = [...manualRates, ...MOROCCO_DELIVERY_RATES].filter((rate, index, list) => {
    const key = normalizeCityKey(rate.city)
    return key && list.findIndex((item) => normalizeCityKey(item.city) === key) === index
  })

  return merged
}

export const DEFAULT_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: "maroc-delivery",
    name: "Maroc Delivery",
    description: "Default delivery pricing for Moroccan cities.",
    active: true,
    rates: buildDefaultDeliveryRates(),
  },
]

function normalizeDeliveryMethodId(value: string, index: number) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || `delivery-method-${index + 1}`
}

export function normalizeDeliveryMethods(value: unknown): DeliveryMethod[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null

      const raw = item as Partial<DeliveryMethod> & { rates?: unknown }
      const name = typeof raw.name === "string" ? raw.name.trim() : ""
      const description = typeof raw.description === "string" ? raw.description.trim() : ""
      const active = raw.active !== false
      const rates = Array.isArray(raw.rates)
        ? raw.rates
            .map((rate) => {
              if (!rate || typeof rate !== "object") return null

              const rawRate = rate as Partial<DeliveryRate>
              const city = typeof rawRate.city === "string" ? rawRate.city.trim() : ""
              const price = Number(rawRate.price)

              if (!city || !Number.isFinite(price) || price < 0) return null

              return { city, price }
            })
            .filter((rate): rate is DeliveryRate => Boolean(rate))
        : []

      if (!name) return null

      return {
        id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : normalizeDeliveryMethodId(name, index),
        name,
        description,
        active,
        rates,
      }
    })
    .filter((item): item is DeliveryMethod => Boolean(item))
}

export function getDeliveryPrice(methods: DeliveryMethod[], deliveryMethodId: string, city: string) {
  const method = methods.find((item) => item.id === deliveryMethodId && item.active)
  if (!method) return null

  const rate = method.rates.find((item) => item.city.toLowerCase() === city.trim().toLowerCase())
  return typeof rate?.price === "number" ? rate.price : null
}

export async function fetchSiteSettings() {
  try {
    const response = await fetch("/api/site-settings", {
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        whatsappNumber: DEFAULT_CONTACT_WHATSAPP_NUMBER,
        contactPhone: DEFAULT_CONTACT_PHONE,
        contactAddress: DEFAULT_CONTACT_ADDRESS,
        contactGoogleMapsUrl: DEFAULT_CONTACT_GOOGLE_MAPS_URL,
        deliveryMethods: DEFAULT_DELIVERY_METHODS,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      }
    }

    return (await response.json()) as SiteSettingsResponse
  } catch {
    return {
      whatsappNumber: DEFAULT_CONTACT_WHATSAPP_NUMBER,
      contactPhone: DEFAULT_CONTACT_PHONE,
      contactAddress: DEFAULT_CONTACT_ADDRESS,
      contactGoogleMapsUrl: DEFAULT_CONTACT_GOOGLE_MAPS_URL,
      deliveryMethods: DEFAULT_DELIVERY_METHODS,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
    }
  }
}
