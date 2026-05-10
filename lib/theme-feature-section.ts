import type { Locale } from "@/i18n.config"

export type ThemeFeatureCard = {
  title: Record<Locale, string>
  description: Record<Locale, string>
}

export type ThemeFeatureSectionData = {
  leftImageUrl: string
  topImageUrl: string
  bottomImageUrl: string
  videoImageUrl: string
  overlayTitle: Record<Locale, string>
  overlayDescription: Record<Locale, string>
  topTitle: Record<Locale, string>
  topSubtitle: Record<Locale, string>
  topBullet1: Record<Locale, string>
  topBullet2: Record<Locale, string>
  topBullet3: Record<Locale, string>
  sectionEyebrow: Record<Locale, string>
  sectionTitle: Record<Locale, string>
  sectionDescription: Record<Locale, string>
  bottomEyebrow: Record<Locale, string>
  bottomTitle: Record<Locale, string>
  cards: ThemeFeatureCard[]
}

export const DEFAULT_THEME_FEATURE_SECTION: ThemeFeatureSectionData = {
  leftImageUrl: "/product2.png",
  topImageUrl: "/product.png",
  bottomImageUrl: "/product2.png",
  videoImageUrl: "/product3.png",
  overlayTitle: {
    en: "Loved by thousands",
    fr: "Adopté par des milliers",
    ar: "محبوب لدى الآلاف",
  },
  overlayDescription: {
    en: "Pure Moroccan olive oil and olives, crafted from the grove to the table.",
    fr: "Huile d’olive et olives marocaines pures, du verger à la table.",
    ar: "زيت زيتون وزيتون مغربي نقي، من البستان إلى المائدة.",
  },
  topTitle: {
    en: "Moroccan Olive",
    fr: "Olive marocaine",
    ar: "زيتون مغربي",
  },
  topSubtitle: {
    en: "Golden, fresh, and full of character",
    fr: "Doré, frais et plein de caractère",
    ar: "ذهبي وطازج ومليء بالشخصية",
  },
  topBullet1: {
    en: "Handpicked olives",
    fr: "Olives cueillies à la main",
    ar: "زيتون مختار يدويًا",
  },
  topBullet2: {
    en: "Cold-pressed olive oil",
    fr: "Huile d’olive pressée à froid",
    ar: "زيت زيتون معصور على البارد",
  },
  topBullet3: {
    en: "Moroccan kitchen favorite",
    fr: "Un favori de la cuisine marocaine",
    ar: "مفضل في المطبخ المغربي",
  },
  sectionEyebrow: {
    en: "Moroccan Olive Tradition",
    fr: "Tradition de l’olive marocaine",
    ar: "تقليد الزيتون المغربي",
  },
  sectionTitle: {
    en: "Loved by thousands, rooted in Morocco.",
    fr: "Adopté par des milliers, enraciné au Maroc.",
    ar: "محبوب لدى الآلاف، ومتجذر في المغرب.",
  },
  sectionDescription: {
    en: "From olives grown under the Moroccan sun to extra virgin olive oil poured at the table, every bottle carries the warmth, flavor, and character of the grove.",
    fr: "Des olives cultivées sous le soleil marocain à l’huile d’olive vierge extra servie à table, chaque bouteille porte la chaleur, la saveur et le caractère du verger.",
    ar: "من الزيتون الذي ينمو تحت الشمس المغربية إلى زيت الزيتون البكر الممتاز على المائدة، تحمل كل زجاجة دفء البستان ونكهته وشخصيته.",
  },
  bottomEyebrow: {
    en: "From Olive Groves",
    fr: "Des oliveraies",
    ar: "من بساتين الزيتون",
  },
  bottomTitle: {
    en: "to Moroccan Tables",
    fr: "aux tables marocaines",
    ar: "إلى الموائد المغربية",
  },
  cards: [
    {
      title: {
        en: "Moroccan Groves",
        fr: "Vergers marocains",
        ar: "بساتين مغربية",
      },
      description: {
        en: "Handpicked olives from sun-soaked Moroccan orchards",
        fr: "Des olives cueillies à la main dans les vergers baignés de soleil",
        ar: "زيتون مختار يدويًا من بساتين المغرب المشمسة",
      },
    },
    {
      title: {
        en: "Pure Olive Oil",
        fr: "Huile pure",
        ar: "زيت زيتون نقي",
      },
      description: {
        en: "Cold-pressed for a rich, smooth, golden finish",
        fr: "Pressée à froid pour une finale riche, douce et dorée",
        ar: "معصور على البارد بنهاية غنية وناعمة وذهبية",
      },
    },
    {
      title: {
        en: "Olive Heritage",
        fr: "Héritage oléicole",
        ar: "تراث الزيتون",
      },
      description: {
        en: "A family tradition shaped by olive trees and care",
        fr: "Une tradition familiale façonnée par les oliviers et le soin",
        ar: "تقليد عائلي تشكل مع أشجار الزيتون والعناية",
      },
    },
    {
      title: {
        en: "Loved Across Morocco",
        fr: "Apprécié partout au Maroc",
        ar: "محبوب في كل المغرب",
      },
      description: {
        en: "A taste that feels at home in every Moroccan kitchen",
        fr: "Un goût qui se sent chez lui dans chaque cuisine marocaine",
        ar: "طعم يشعر بالانتماء إلى كل مطبخ مغربي",
      },
    },
  ],
}

export function fetchThemeFeatureSection() {
  return fetch("/api/theme-feature-section", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_FEATURE_SECTION
    return (await response.json()) as ThemeFeatureSectionData
  })
}
