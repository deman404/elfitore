import type { Locale } from "@/i18n.config"

export type ThemeCtaBannerData = {
  backgroundImageUrl: string
  title1: Record<Locale, string>
  title2: Record<Locale, string>
  leaf: Record<Locale, string>
  flower: Record<Locale, string>
  globe: Record<Locale, string>
}

export const DEFAULT_THEME_CTA_BANNER: ThemeCtaBannerData = {
  backgroundImageUrl: "/product4.png",
  title1: {
    en: "100% Natural",
    fr: "100% naturel",
    ar: "طبيعي 100%",
  },
  title2: {
    en: "From Morocco with care",
    fr: "Du Maroc avec soin",
    ar: "من المغرب بعناية",
  },
  leaf: {
    en: "No harsh chemicals",
    fr: "Sans produits agressifs",
    ar: "من دون مواد قاسية",
  },
  flower: {
    en: "Plant-based goodness",
    fr: "Bienfaits d'origine végétale",
    ar: "خير نباتي طبيعي",
  },
  globe: {
    en: "Ethically sourced",
    fr: "Sourcé de façon éthique",
    ar: "مصادر أخلاقية",
  },
}

export function fetchThemeCtaBanner() {
  return fetch("/api/theme-cta-banner", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_CTA_BANNER
    return (await response.json()) as ThemeCtaBannerData
  })
}
