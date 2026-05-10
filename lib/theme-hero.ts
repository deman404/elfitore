import type { Locale } from "@/i18n.config"

export type ThemeHeroMediaType = "image" | "video"

export type ThemeHeroCopy = {
  subtitle: Record<Locale, string>
  title1: Record<Locale, string>
  title2: Record<Locale, string>
  description: Record<Locale, string>
  cta: Record<Locale, string>
  scroll: Record<Locale, string>
}

export type ThemeHeroData = ThemeHeroCopy & {
  mediaType: ThemeHeroMediaType
  mediaUrl: string
}

export const DEFAULT_THEME_HERO: ThemeHeroData = {
  mediaType: "video",
  mediaUrl: "/video/olive.mp4",
  subtitle: {
    en: "Premium Moroccan Olive",
    fr: "Huile d'Olive Marocaine Premium",
    ar: "زيت الزيتون المغربي الممتاز",
  },
  title1: {
    en: "Taste the",
    fr: "Goûtez l'",
    ar: "ذوقوا",
  },
  title2: {
    en: "Essence of Morocco",
    fr: "Essence du Maroc",
    ar: "جوهر المغرب",
  },
  description: {
    en: "Authentic Moroccan olive oils and premium olives, crafted with tradition and care.",
    fr: "Huiles d'olive marocaines authentiques et olives premium, élaborées avec tradition et soin.",
    ar: "زيوت زيتون مغربية أصلية وزيتون فاخر، يتم إعدادها بالتقليد والعناية.",
  },
  cta: {
    en: "Shop Now",
    fr: "Acheter Maintenant",
    ar: "تسوق الآن",
  },
  scroll: {
    en: "Scroll",
    fr: "Défiler",
    ar: "مرر",
  },
}

export function getThemeHeroText(locale: Locale, hero: ThemeHeroData = DEFAULT_THEME_HERO) {
  return {
    subtitle: hero.subtitle[locale] || hero.subtitle.en,
    title1: hero.title1[locale] || hero.title1.en,
    title2: hero.title2[locale] || hero.title2.en,
    description: hero.description[locale] || hero.description.en,
    cta: hero.cta[locale] || hero.cta.en,
    scroll: hero.scroll[locale] || hero.scroll.en,
  }
}

export function normalizeThemeHeroMediaType(value: unknown): ThemeHeroMediaType {
  return value === "image" ? "image" : "video"
}

export function normalizeThemeHeroUrl(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function isValidThemeHeroText(value: string) {
  return value.trim().length > 0
}

export async function fetchThemeHero() {
  const response = await fetch("/api/theme-hero", { cache: "no-store" })

  if (!response.ok) {
    return DEFAULT_THEME_HERO
  }

  return (await response.json()) as ThemeHeroData
}
