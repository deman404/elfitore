"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Video } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { formatBlogDate, type BlogPost } from "@/lib/blog"
import type { Locale } from "@/i18n.config"
import { useParams } from "next/navigation"

const translations = {
  en: {
    back: "Back to blog",
    notFound: "Blog post not found.",
  },
  fr: {
    back: "Retour au blog",
    notFound: "Article introuvable.",
  },
  ar: {
    back: "العودة إلى المدونة",
    notFound: "المقال غير موجود.",
  },
} as const

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ""
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const blogLocale = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US"

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const response = await fetch(`/api/blog-posts/${slug}`, { cache: "no-store" })
      if (!response.ok) {
        setPost(null)
        setLoading(false)
        return
      }

      const data = (await response.json().catch(() => ({}))) as BlogPost | { error?: string }
      if (data && typeof data === "object" && "error" in data) {
        setPost(null)
      } else {
        setPost(data as BlogPost)
      }
      setLoading(false)
    }

    if (slug) {
      void load()
    }
  }, [slug])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className={`mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          {loading ? (
            <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 aspect-[16/9] animate-pulse rounded-[1.5rem] bg-muted" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : !post ? (
            <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
              {t.notFound}
            </div>
          ) : (
            <article className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatBlogDate(post.created_at, blogLocale)}
              </div>
              <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">{post.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{post.excerpt}</p>

              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted">
                {post.media_type === "video" ? (
                  <video src={post.media_url} controls className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="relative aspect-[16/9]">
                    <Image src={post.media_url} alt={post.title} fill className="object-cover" sizes="100vw" />
                  </div>
                )}
              </div>

              <div className="prose prose-neutral mt-8 max-w-none">
                <div className="whitespace-pre-wrap text-base leading-8 text-foreground">{post.content}</div>
              </div>
            </article>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
