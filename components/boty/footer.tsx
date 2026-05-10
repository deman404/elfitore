"use client"

import Link from "next/link"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const footerLinks: Record<Locale, { shop: Array<{name: string; href: string}>; about: Array<{name: string; href: string}>; support: Array<{name: string; href: string}> }> = {
  en: {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "Olive Oils", href: "/shop?category=oil" },
      { name: "Olives", href: "/shop?category=olives" },
      { name: "Gift Sets", href: "/shop" },
      { name: "New Arrivals", href: "/shop" }
    ],
    about: [
      { name: "Our Story", href: "/" },
      { name: "About Morocco", href: "/" },
      { name: "Sustainability", href: "/" },
      { name: "Press", href: "/" }
    ],
    support: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" }
    ]
  },
  fr: {
    shop: [
      { name: "Tous les produits", href: "/shop" },
      { name: "Huiles d'olive", href: "/shop?category=oil" },
      { name: "Olives", href: "/shop?category=olives" },
      { name: "Coffrets cadeaux", href: "/shop" },
      { name: "Nouveautés", href: "/shop" }
    ],
    about: [
      { name: "Notre histoire", href: "/" },
      { name: "À propos du Maroc", href: "/" },
      { name: "Développement durable", href: "/" },
      { name: "Presse", href: "/" }
    ],
    support: [
      { name: "Nous contacter", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Livraison", href: "/shipping" },
      { name: "Retours", href: "/returns" }
    ]
  },
  ar: {
    shop: [
      { name: "جميع المنتجات", href: "/shop" },
      { name: "زيوت الزيتون", href: "/shop?category=oil" },
      { name: "الزيتون", href: "/shop?category=olives" },
      { name: "مجموعات هدايا", href: "/shop" },
      { name: "الوصول الجديد", href: "/shop" }
    ],
    about: [
      { name: "قصتنا", href: "/" },
      { name: "عن المغرب", href: "/" },
      { name: "الاستدامة", href: "/" },
      { name: "صحافة", href: "/" }
    ],
    support: [
      { name: "اتصل بنا", href: "/contact" },
      { name: "الأسئلة الشائعة", href: "/faq" },
      { name: "التوصيل", href: "/shipping" },
      { name: "المرتجعات", href: "/returns" }
    ]
  }
}

const footerTexts: Record<Locale, { shop: string; about: string; support: string; copyright: string; privacy: string; terms: string; description: string }> = {
  en: {
    shop: 'Shop',
    about: 'About',
    support: 'Support',
    copyright: 'All rights reserved',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    description: 'Premium Moroccan olive oils and olives, bringing authentic flavors and quality to your table.'
  },
  fr: {
    shop: 'Boutique',
    about: 'À propos',
    support: 'Support',
    copyright: 'Tous droits réservés',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
    description: 'Huiles d\'olive et olives marocaines premium, apportant des saveurs authentiques et une qualité à votre table.'
  },
  ar: {
    shop: 'متجر',
    about: 'عن',
    support: 'دعم',
    copyright: 'جميع الحقوق محفوظة',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    description: 'زيوت زيتون وزيتون مغربي فاخر، يجلب النكهات الأصلية والجودة إلى طاولتك.'
  }
}

export function Footer() {
  const { locale, isRTL } = useLanguage()
  const links = footerLinks[locale as Locale]
  const texts = footerTexts[locale as Locale]

  return (
    <footer className="relative overflow-hidden bg-card pt-16 pb-10 sm:pt-20">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="whitespace-nowrap font-serif text-[96px] font-bold leading-none text-[#4f5b3a]/20 sm:text-[160px] md:text-[280px] lg:text-[400px]">
          El Fitore
        </span>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="font-serif text-3xl text-foreground mb-4">El Fitore</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {texts.description}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{texts.shop}</h3>
            <ul className="space-y-3">
              {links.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{texts.about}</h3>
            <ul className="space-y-3">
              {links.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{texts.support}</h3>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-10 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} El Fitore. {texts.copyright}.
          </p>
          <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
              {texts.privacy}
            </Link>
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
              {texts.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
