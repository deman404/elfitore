import type { Locale } from "@/i18n.config"

export type ThemeHomeCategoryCard = {
  title: Record<Locale, string>
  description: Record<Locale, string>
  imageUrl: string
  categoryId: number | null
}

export type ThemeHomeCategoriesData = {
  cards: ThemeHomeCategoryCard[]
}

export type ThemeHomeCategoryWarning = {
  index: number
  message: string
}

export const THEME_HOME_CATEGORY_FALLBACK_IMAGE = "/images/products/oil.jpg"

export function isRenderableThemeHomeCategoryImageUrl(value: unknown) {
  if (typeof value !== "string") return false

  const trimmed = value.trim()
  if (!trimmed) return false

  return /^(https?:\/\/|\/(?!\/))/i.test(trimmed)
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
      categoryId: null,
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
      categoryId: null,
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
      categoryId: null,
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
      categoryId: null,
    },
  ],
}

export function normalizeThemeHomeCategoriesData(value: unknown): ThemeHomeCategoriesData {
  const cards = Array.isArray((value as { cards?: unknown } | null)?.cards)
    ? ((value as { cards: unknown[] }).cards ?? [])
    : DEFAULT_THEME_HOME_CATEGORIES.cards

  return {
    cards: cards.map((card, index) => normalizeThemeHomeCategoryCard(card, index)),
  }
}

export function normalizeThemeHomeCategoryCard(value: unknown, index: number): ThemeHomeCategoryCard {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  const fallbackCard = DEFAULT_THEME_HOME_CATEGORIES.cards[index] ?? DEFAULT_THEME_HOME_CATEGORIES.cards[0]

  return {
    title: {
      en: stringOrDefault(source.title, "en", fallbackCard.title.en),
      fr: stringOrDefault(source.title, "fr", fallbackCard.title.fr),
      ar: stringOrDefault(source.title, "ar", fallbackCard.title.ar),
    },
    description: {
      en: stringOrDefault(source.description, "en", fallbackCard.description.en),
      fr: stringOrDefault(source.description, "fr", fallbackCard.description.fr),
      ar: stringOrDefault(source.description, "ar", fallbackCard.description.ar),
    },
    imageUrl: isRenderableThemeHomeCategoryImageUrl(source.imageUrl)
      ? String(source.imageUrl).trim()
      : fallbackCard.imageUrl || THEME_HOME_CATEGORY_FALLBACK_IMAGE,
    categoryId:
      typeof source.categoryId === "number"
        ? source.categoryId
        : typeof source.categoryId === "string" && source.categoryId.trim() && !Number.isNaN(Number(source.categoryId))
          ? Number(source.categoryId)
          : fallbackCard.categoryId ?? null,
  }
}

export function validateThemeHomeCategoryCards(
  cards: Array<Record<string, unknown>>,
  categoryIds: number[]
): ThemeHomeCategoryWarning[] {
  const idSet = new Set(categoryIds)

  return cards.flatMap((card, index) => {
    const warnings: ThemeHomeCategoryWarning[] = []

    if (!isRenderableThemeHomeCategoryImageUrl(card.imageUrl)) {
      warnings.push({
        index,
        message: `Carte ${index + 1} : image manquante ou invalide, fallback visuel appliqué.`,
      })
    }

    const categoryId = typeof card.categoryId === "number" ? card.categoryId : null
    if (categoryId !== null && !idSet.has(categoryId)) {
      warnings.push({
        index,
        message: `Carte ${index + 1} : la catégorie #${categoryId} n'existe plus dans product_categories.`,
      })
    }

    return warnings
  })
}

export function fetchThemeHomeCategories() {
  return fetch("/api/theme-home-categories", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_HOME_CATEGORIES
    return normalizeThemeHomeCategoriesData(await response.json())
  })
}

function stringOrDefault(
  value: unknown,
  locale: Locale,
  fallback: string
) {
  if (!value || typeof value !== "object") return fallback

  const localized = (value as Record<string, unknown>)[locale]
  return typeof localized === "string" && localized.trim() ? localized.trim() : fallback
}
