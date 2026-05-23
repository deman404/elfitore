"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-context"
import { FreeShippingBadge } from "@/components/boty/free-shipping-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { type CatalogCategoryRow } from "@/lib/catalog"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    shop: "Shop",
    categories: "Categories",
    about: "About",
    story: "Our Story",
    blog: "Blog",
    contact: "Contact",
    cart: "Cart",
    menu: "Toggle menu",
  },
  fr: {
    shop: "Boutique",
    categories: "Catégories",
    about: "À propos",
    story: "Notre histoire",
    blog: "Blog",
    contact: "Contact",
    cart: "Panier",
    menu: "Basculer le menu",
  },
  ar: {
    shop: "المتجر",
    categories: "التصنيفات",
    about: "عنّا",
    story: "قصتنا",
    blog: "المدونة",
    contact: "اتصل",
    cart: "السلة",
    menu: "تبديل القائمة",
  },
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([])
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { setIsOpen, itemCount } = useCart()
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("id, name, slug, active")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .limit(4)

      setCategories((data ?? []) as CatalogCategoryRow[])
    }

    void loadCategories()
  }, [supabase])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="">
       <FreeShippingBadge />
      </div>

      <div className="px-3 pt-2 sm:px-4 sm:pt-3">
        <nav
          className="mx-auto max-w-7xl rounded-2xl border border-[rgba(255,255,255,0.32)] bg-[rgba(255,255,255,0.55)] px-4 backdrop-blur-md animate-scale-fade-in sm:px-6 lg:px-8"
          style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px" }}
        >
          <div className="grid h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 lg:flex lg:justify-between">
            <button
              type="button"
              className="justify-self-start p-2 text-foreground/80 hover:text-foreground boty-transition lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label={t.menu}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className={`hidden items-center gap-8 lg:flex ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link href="/shop" className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition">
                {t.shop}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
                  >
                    {t.categories}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"} className="min-w-52 p-2">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">{t.categories}</p>
                    <p className="mt-1 text-xs text-foreground/60">Tap a category to open its products.</p>
                  </div>
                  <div className="mt-1 space-y-1">
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.slug} asChild>
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
                        >
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/propos" className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition">
                {t.about}
              </Link>
              <Link href="/our-story" className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition">
                {t.story}
              </Link>
              <Link href="/blog" className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition">
                {t.blog}
              </Link>
              <Link href="/contact" className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition">
                {t.contact}
              </Link>
            </div>

            <Link href="/" className="justify-self-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <span className="relative block h-10 w-32 sm:h-12 sm:w-40">
                <Image
                  src="/logo.png"
                  alt="El Fitore"
                  fill
                  priority
                  sizes="(max-width: 640px) 128px, 160px"
                  className="object-contain"
                />
              </span>
            </Link>

            <div className={`flex items-center gap-3 justify-self-end sm:gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
                aria-label={t.cart}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {itemCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <CartDrawer />

          <Sheet
            open={isMenuOpen}
            onOpenChange={(open) => {
              setIsMenuOpen(open)
              if (!open) setIsCategoriesOpen(false)
            }}
          >
            <SheetContent
              side="right"
              className="flex h-[100dvh] w-screen max-w-none flex-col rounded-none border-0 bg-background p-0 sm:max-w-none"
            >
              <SheetHeader className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <SheetTitle className="text-base font-semibold text-foreground">{t.menu}</SheetTitle>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition hover:bg-muted"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </SheetHeader>

              <div className={`flex-1 overflow-y-auto px-5 py-6 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="space-y-5">
                  <Link
                    href="/shop"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-border/60 bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t.shop}
                  </Link>

                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <button
                      type="button"
                      onClick={() => setIsCategoriesOpen((current) => !current)}
                      className={`flex w-full items-center justify-between text-sm font-medium text-foreground ${isRTL ? "flex-row-reverse" : ""}`}
                      aria-expanded={isCategoriesOpen}
                      aria-controls="mobile-category-list"
                    >
                      <span>{t.categories}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      id="mobile-category-list"
                      className={`grid overflow-hidden transition-all duration-300 ${
                        isCategoriesOpen ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <Link
                              key={category.slug}
                              href={`/category/${category.slug}`}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setIsCategoriesOpen(false)
                              }}
                              className="block rounded-xl border border-border/60 bg-background px-3 py-3 text-sm text-foreground/70 transition hover:bg-muted hover:text-foreground"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/propos"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-border/60 bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t.about}
                  </Link>
                  <Link
                    href="/our-story"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-border/60 bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t.story}
                  </Link>
                  <Link
                    href="/blog"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-border/60 bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t.blog}
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-border/60 bg-card px-4 py-4 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t.contact}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
