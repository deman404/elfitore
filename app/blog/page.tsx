"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, ArrowRight, Video } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useLanguage } from "@/components/language-context"
import { formatBlogDate, type BlogPost } from "@/lib/blog"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    eyebrow: "Blog",
    title: "Stories, updates, and product notes",
    subtitle: "Read the latest stories from our brand, our products, and the people behind them.",
    readMore: "Read more",
    empty: "No blog posts have been published yet.",
  },
  fr: {
    eyebrow: "Blog",
    title: "Histoires, actualités et notes produits",
    subtitle: "Découvrez les derniers récits autour de la marque, des produits et de l’équipe.",
    readMore: "Lire plus",
    empty: "Aucun article n’a encore été publié.",
  },
  ar: {
    eyebrow: "المدونة",
    title: "قصص وتحديثات وملاحظات حول المنتجات",
    subtitle: "اقرأ أحدث القصص عن العلامة والمنتجات والأشخاص وراءها.",
    readMore: "اقرأ المزيد",
    empty: "لم يتم نشر أي مقالات بعد.",
  },
} as const

export default function BlogPage() {
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const blogLocale = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US"

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const response = await fetch("/api/blog-posts", { cache: "no-store" })
      const data = (await response.json().catch(() => [])) as BlogPost[] | { error?: string }
      setPosts(Array.isArray(data) ? data : [])
      setLoading(false)
    }

    void load()
  }, [])

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className={`rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{t.eyebrow}</p>
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">{t.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{t.subtitle}</p>
            </div>

            <div className="mt-10">
              {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background">
                      <div className="aspect-[16/10] animate-pulse bg-muted" />
                      <div className="space-y-3 p-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-border/60 bg-background p-10 text-center text-sm text-muted-foreground">
                  {t.empty}
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                      <article className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                        <div className="relative aspect-[16/10] bg-muted">
                          {post.media_type === "video" ? (
                            <video src={post.media_url} className="h-full w-full object-cover" muted playsInline />
                          ) : (
                            <Image src={post.media_url} alt={post.title} fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                          )}
                          <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                            {post.media_type === "video" ? <Video className="inline h-3 w-3" /> : "Blog"}
                          </div>
                        </div>
                        <div className="space-y-3 p-5">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatBlogDate(post.created_at, blogLocale)}
                          </div>
                          <h2 className="font-serif text-2xl text-foreground">{post.title}</h2>
                          <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                            {t.readMore}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

