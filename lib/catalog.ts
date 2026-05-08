import type { Locale } from "@/i18n.config"

export type CatalogProductRow = {
  id: number
  name_en: string
  name_fr: string
  name_ar: string
  description_en: string
  description_fr: string
  description_ar: string
  price: number
  image: string
  images: string[] | string | null
  category: string
  sizes: unknown
}

export type CatalogCategoryRow = {
  id: number
  name: string
  slug: string
  active?: boolean
}

export type NormalizedProduct = {
  dbId: number
  id: string
  category: string
  name: Record<Locale, string>
  description: Record<Locale, string>
  price: number
  image: string
  images: string[]
  sizes: Array<{ label: string; price: number }>
}

const localeKeys: Locale[] = ["en", "fr", "ar"]

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && Boolean(item))
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && Boolean(item))
      }
    } catch {
      return [value]
    }
  }

  return []
}

export function parseProductSizes(value: unknown, fallbackPrice?: number) {
  const normalized = (() => {
    if (Array.isArray(value)) {
      return value
    }

    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value) as unknown
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    return []
  })()

  const sizes = normalized
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const label = "label" in item ? String((item as { label?: unknown }).label ?? "").trim() : ""
      const price = "price" in item ? Number((item as { price?: unknown }).price) : Number.NaN
      if (!label || Number.isNaN(price)) return null
      return { label, price }
    })
    .filter((item): item is { label: string; price: number } => Boolean(item))

  if (sizes.length > 0) {
    return sizes
  }

  if (typeof fallbackPrice === "number" && Number.isFinite(fallbackPrice)) {
    return [{ label: "Standard", price: fallbackPrice }]
  }

  return []
}

export function normalizeProductRow(row: CatalogProductRow): NormalizedProduct {
  return {
    dbId: row.id,
    id: String(row.id),
    category: row.category,
    name: {
      en: row.name_en,
      fr: row.name_fr,
      ar: row.name_ar,
    },
    description: {
      en: row.description_en,
      fr: row.description_fr,
      ar: row.description_ar,
    },
    price: row.price,
    image: row.image,
    images: parseStringArray(row.images).filter(Boolean),
    sizes: parseProductSizes(row.sizes, row.price),
  }
}

export function getLocalizedValue(record: Record<Locale, string>, locale: Locale) {
  return record[locale] ?? record.en ?? localeKeys.map((key) => record[key]).find(Boolean) ?? ""
}
