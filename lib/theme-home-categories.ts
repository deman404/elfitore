import type { Locale } from "@/i18n.config"

export type ThemeHomeCategoryCard = {
  title: Record<Locale, string>
  description: Record<Locale, string>
  imageUrl: string
  categorySlug: string
}

export type ThemeHomeCategoriesData = {
  cards: ThemeHomeCategoryCard[]
}

export const DEFAULT_THEME_HOME_CATEGORIES: ThemeHomeCategoriesData = {
  cards: [
    {
      title: {
        en: "Olive Collection",
        fr: "Collection d’olive",
        ar: "مجموعة الزيتون",
      },
      description: {
        en: "Fresh olive oils and olive picks for everyday use.",
        fr: "Huiles d’olive fraîches et olives pour tous les jours.",
        ar: "زيوت زيتون طازجة واختيارات زيتون للاستخدام اليومي.",
      },
      imageUrl: "/product.png",
      categorySlug: "",
    },
    {
      title: {
        en: "Olive Oil",
        fr: "Huile d’olive",
        ar: "زيت الزيتون",
      },
      description: {
        en: "Cold-pressed and rich in flavor.",
        fr: "Pressée à froid et riche en goût.",
        ar: "معصور على البارد وغني بالنكهة.",
      },
      imageUrl: "/product2.png",
      categorySlug: "",
    },
    {
      title: {
        en: "Olives",
        fr: "Olives",
        ar: "الزيتون",
      },
      description: {
        en: "Selected for taste, texture, and quality.",
        fr: "Choisies pour leur goût, texture et qualité.",
        ar: "مختارة للطعم والقوام والجودة.",
      },
      imageUrl: "/product3.png",
      categorySlug: "",
    },
    {
      title: {
        en: "Gift Boxes",
        fr: "Coffrets cadeaux",
        ar: "علب هدايا",
      },
      description: {
        en: "Beautiful sets ready for sharing.",
        fr: "De beaux coffrets prêts à offrir.",
        ar: "مجموعات جميلة جاهزة للمشاركة.",
      },
      imageUrl: "/product4.png",
      categorySlug: "",
    },
  ],
}

export function fetchThemeHomeCategories() {
  return fetch("/api/theme-home-categories", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_HOME_CATEGORIES
    return (await response.json()) as ThemeHomeCategoriesData
  })
}
