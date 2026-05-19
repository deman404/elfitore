export type BlogMediaType = "image" | "video"

export type BlogPostRow = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  media_type: BlogMediaType
  media_url: string
  published: boolean
  created_at: string
  updated_at: string
}

export type BlogPost = BlogPostRow & {
  createdAt: string
  updatedAt: string
}

export type BlogPostInput = {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  mediaType: BlogMediaType
  mediaUrl: string
  published: boolean
}

export function normalizeBlogPostRow(row: BlogPostRow): BlogPost {
  return {
    ...row,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatBlogDate(value: string, locale: string = "fr-FR") {
  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

