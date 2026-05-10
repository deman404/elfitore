export const SITE_SETTING_WHATSAPP_NUMBER_KEY = "whatsapp_number"

export type SiteSettingsResponse = {
  whatsappNumber: string
}

export function normalizeWhatsAppNumber(value: string) {
  return value.trim()
}

export function formatWhatsAppNumberForLink(value: string) {
  return value.replace(/[^\d]/g, "")
}

export function isValidWhatsAppNumber(value: string) {
  const digitsOnly = formatWhatsAppNumberForLink(value)
  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

export async function fetchSiteSettings() {
  const response = await fetch("/api/site-settings", {
    cache: "no-store",
  })

  if (!response.ok) {
    return { whatsappNumber: "" }
  }

  return (await response.json()) as SiteSettingsResponse
}
