type ElfitorCategory = {
  name?: string
  slug?: string
  description?: string
}

type ElfitorVariant = {
  price?: number
  values?: string[]
  variations?: Record<string, string>
}

type ElfitorImage = {
  url?: string
}

type ElfitorProduct = {
  id?: string
  name?: string
  slug?: string
  public_url?: string
  thumbnail?: string
  description?: string
  price?: number
  images?: ElfitorImage[]
  variants?: ElfitorVariant[]
  categories?: ElfitorCategory[]
}

export type ImportedElfitorCategory = {
  name: string
  slug: string
  description: string
}

export type ImportedElfitorProduct = {
  category: ImportedElfitorCategory
  description: string
  externalId: string
  image: string
  images: string[]
  name: string
  price: number
  sourceUrl: string
  sizes: Array<{ label: string; price: number }>
}

const SITEMAP_INDEX_URL = "https://elfitor.ma/sitemap.xml"

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function extractXmlLocations(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1] ?? "").filter(Boolean)
}

function extractProductJson(html: string) {
  const match = html.match(/:product="([^"]+)"/)

  if (!match?.[1]) {
    throw new Error("Could not find product data on the Elfitor page.")
  }

  const raw = decodeHtmlEntities(match[1])
  return JSON.parse(raw) as ElfitorProduct
}

function normalizeProduct(product: ElfitorProduct): ImportedElfitorProduct {
  const categories = Array.isArray(product.categories) ? product.categories : []
  const category = categories[0] ?? {}
  const importedCategory: ImportedElfitorCategory = {
    name: category.name?.trim() || "Elfitor",
    slug: category.slug?.trim() || "elfitor",
    description: category.description?.trim() || category.name?.trim() || "Elfitor",
  }

  const images = Array.isArray(product.images)
    ? product.images.map((image) => image.url?.trim() ?? "").filter(Boolean)
    : []

  const sizes = Array.isArray(product.variants)
    ? product.variants
        .map((variant) => {
          const label = variant.values?.[0] ?? variant.variations?.taille ?? ""
          const price = typeof variant.price === "number" ? variant.price : Number.NaN

          if (!label || Number.isNaN(price)) {
            return null
          }

          return {
            label: String(label).trim(),
            price,
          }
        })
        .filter((item): item is { label: string; price: number } => Boolean(item))
    : []

  const description = product.description ? stripHtml(product.description) : ""
  const name = product.name?.trim() || importedCategory.name
  const image = images[0] || product.thumbnail?.trim() || ""
  const price = typeof product.price === "number" ? product.price : sizes[0]?.price ?? 0

  return {
    category: importedCategory,
    description,
    externalId: product.id?.trim() || product.slug?.trim() || product.public_url?.trim() || name,
    image,
    images,
    name,
    price,
    sourceUrl: product.public_url?.trim() || "",
    sizes: sizes.length ? sizes : [{ label: "Standard", price }],
  }
}

export async function fetchElfitorCatalog() {
  const sitemapResponse = await fetch(SITEMAP_INDEX_URL, { cache: "no-store" })

  if (!sitemapResponse.ok) {
    throw new Error(`Could not load Elfitor sitemap: ${sitemapResponse.status} ${sitemapResponse.statusText}`)
  }

  const sitemapXml = await sitemapResponse.text()
  const sitemapUrls = extractXmlLocations(sitemapXml).filter((url) => url.includes("products_"))

  if (!sitemapUrls.length) {
    throw new Error("Could not find the Elfitor product sitemap.")
  }

  const productUrls = new Set<string>()

  for (const sitemapUrl of sitemapUrls) {
    const productSitemapResponse = await fetch(sitemapUrl, { cache: "no-store" })

    if (!productSitemapResponse.ok) {
      throw new Error(`Could not load product sitemap: ${productSitemapResponse.status} ${productSitemapResponse.statusText}`)
    }

    const productSitemapXml = await productSitemapResponse.text()

    for (const url of extractXmlLocations(productSitemapXml)) {
      productUrls.add(url)
    }
  }

  const products = await Promise.all(
    [...productUrls].map(async (url) => {
      const response = await fetch(url, { cache: "no-store" })

      if (!response.ok) {
        throw new Error(`Could not load product page ${url}: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()
      const product = extractProductJson(html)

      return normalizeProduct(product)
    }),
  )

  const categories = Array.from(
    new Map(products.map((product) => [product.category.slug, product.category])).values(),
  )

  return {
    categories,
    products,
  }
}
