"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const translations = {
  en: { shop: 'Shop', about: 'About', contact: 'Contact', cart: 'Cart', menu: 'Toggle menu' },
  fr: { shop: 'Boutique', about: 'À propos', contact: 'Contact', cart: 'Panier', menu: 'Basculer le menu' },
  ar: { shop: 'المتجر', about: 'عن', contact: 'اتصل', cart: 'السلة', menu: 'تبديل القائمة' }
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setIsOpen, itemCount } = useCart()
  const { locale, isRTL } = useLanguage()
  const t = translations[locale as Locale]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        className="mx-auto max-w-7xl rounded-2xl border border-[rgba(255,255,255,0.32)] bg-[rgba(255,255,255,0.45)] px-4 backdrop-blur-md animate-scale-fade-in sm:px-6 lg:px-8"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}
      >
        <div className="grid h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 lg:flex lg:justify-between">
          {/* Mobile menu button */}
          <button
            type="button"
            className="justify-self-start p-2 text-foreground/80 hover:text-foreground boty-transition lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t.menu}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className={`hidden lg:flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href="/shop"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.shop}
            </Link>
            <Link
              href="/"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.about}
            </Link>
            <Link
              href="/"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.contact}
            </Link>
          </div>

          {/* Logo */}
          <Link href="/" className="justify-self-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <h1 className="font-serif text-2xl tracking-wider text-foreground sm:text-3xl">El Fitore</h1>
          </Link>

          {/* Right Actions */}
          <div className={`justify-self-end flex items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label={t.cart}
            >
              <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden boty-transition ${
            isMenuOpen ? "max-h-64 pb-6" : "max-h-0"
          }`}
        >
          <div className={`flex flex-col gap-4 border-t border-border/50 pt-4 ${isRTL ? 'items-end' : ''}`}>
            <Link
              href="/shop"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.shop}
            </Link>
            <Link
              href="/"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.about}
            </Link>
            <Link
              href="/"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              {t.contact}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
