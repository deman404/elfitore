import type { Locale } from "@/i18n.config"

export type ThemeTrustBadge = {
  title: Record<Locale, string>
  description: Record<Locale, string>
}

export type ThemeTrustBadgesData = {
  badges: ThemeTrustBadge[]
}

export const DEFAULT_THEME_TRUST_BADGES: ThemeTrustBadgesData = {
  badges: [
    {
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

export function fetchThemeTrustBadges() {
  return fetch("/api/theme-trust-badges", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_TRUST_BADGES
    return (await response.json()) as ThemeTrustBadgesData
  })
}
