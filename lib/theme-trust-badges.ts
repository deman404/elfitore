import type { Locale } from "@/i18n.config"

export const TRUST_BADGE_ICON_OPTIONS = [
  { value: "leaf", label: "Leaf" },
  { value: "droplets", label: "Droplets" },
  { value: "sparkles", label: "Sparkles" },
  { value: "flower", label: "Flower" },
  { value: "recycle", label: "Recycle" },
  { value: "globe", label: "Globe" },
  { value: "shield", label: "Shield" },
  { value: "truck", label: "Delivery" },
] as const

export type ThemeTrustBadgeIcon = (typeof TRUST_BADGE_ICON_OPTIONS)[number]["value"]

export type ThemeTrustBadge = {
  icon: ThemeTrustBadgeIcon
  title: Record<Locale, string>
  description: Record<Locale, string>
}

export type ThemeTrustBadgesData = {
  badges: ThemeTrustBadge[]
}

export const DEFAULT_THEME_TRUST_BADGES: ThemeTrustBadgesData = {
  badges: [
    {
      icon: "leaf",
      title: {
        en: "Cold Pressed",
        fr: "Pressé à froid",
        ar: "معصور على البارد",
      },
      description: {
        en: "Preserved flavor and nutrients",
        fr: "Saveur et nutriments préservés",
        ar: "يحافظ على النكهة والعناصر الغذائية",
      },
    },
    {
      icon: "droplets",
      title: {
        en: "Pure Olive Oil",
        fr: "Huile pure",
        ar: "زيت نقي",
      },
      description: {
        en: "No additives or blends",
        fr: "Sans additifs ni mélanges",
        ar: "من دون إضافات أو خلطات",
      },
    },
    {
      icon: "sparkles",
      title: {
        en: "Trusted Quality",
        fr: "Qualité fiable",
        ar: "جودة موثوقة",
      },
      description: {
        en: "Carefully selected at source",
        fr: "Sélectionnée avec soin",
        ar: "مختار بعناية من المصدر",
      },
    },
    {
      icon: "flower",
      title: {
        en: "Moroccan Heritage",
        fr: "Héritage marocain",
        ar: "تراث مغربي",
      },
      description: {
        en: "Rooted in family tradition",
        fr: "Ancré dans la tradition familiale",
        ar: "متجذر في تقاليد العائلة",
      },
    },
  ],
}

export function normalizeThemeTrustBadgeIcon(value: unknown, fallback?: ThemeTrustBadgeIcon) {
  const fallbackIcon = fallback ?? "leaf"
  return TRUST_BADGE_ICON_OPTIONS.some((option) => option.value === value) ? (value as ThemeTrustBadgeIcon) : fallbackIcon
}

export function fetchThemeTrustBadges() {
  return fetch("/api/theme-trust-badges", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_TRUST_BADGES
    return (await response.json()) as ThemeTrustBadgesData
  })
}
