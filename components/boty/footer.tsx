"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Music2 } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import { DEFAULT_THEME_FOOTER, fetchThemeFooter, type ThemeFooterData } from "@/lib/theme-footer"

const footerTexts: Record<Locale, { shop: string; links: string; support: string; copyright: string; privacy: string; terms: string; description: string }> = {
  en: {
    shop: 'Shop',
    links: 'Links',
    support: 'Support',
    copyright: 'All rights reserved',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    description: 'Premium Moroccan olive oils and olives, bringing authentic flavors and quality to your table.'
  },
  fr: {
    shop: 'Boutique',
    links: 'Liens',
    support: 'Support',
    copyright: 'Tous droits réservés',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
    description: 'Huiles d\'olive et olives marocaines premium, apportant des saveurs authentiques et une qualité à votre table.'
  },
  ar: {
    shop: 'متجر',
    links: 'روابط',
    support: 'دعم',
    copyright: 'جميع الحقوق محفوظة',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
    description: 'زيوت زيتون وزيتون مغربي فاخر، يجلب النكهات الأصلية والجودة إلى طاولتك.'
  }
}

const socialLinks = {
  facebook: DEFAULT_THEME_FOOTER.socialLinks.facebook,
  instagram: DEFAULT_THEME_FOOTER.socialLinks.instagram,
  tiktok: DEFAULT_THEME_FOOTER.socialLinks.tiktok,
} as const

export function Footer() {
  const { locale, isRTL } = useLanguage()
  const texts = footerTexts[locale as Locale]
  const [data, setData] = useState<ThemeFooterData>(DEFAULT_THEME_FOOTER)

  useEffect(() => {
    const load = async () => {
      const next = await fetchThemeFooter()
      setData(next)
    }

    void load()
  }, [])

  const links = {
    shop: data.shopLinks.map((link) => ({ name: link.name[locale as Locale], href: link.href })),
    links: data.usefulLinks.map((link) => ({ name: link.name[locale as Locale], href: link.href })),
    support: data.supportLinks.map((link) => ({ name: link.name[locale as Locale], href: link.href })),
  }

  return (
    <footer className="relative overflow-hidden bg-card pt-16 pb-10 sm:pt-20">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="whitespace-nowrap font-serif text-[96px] font-bold leading-none text-[#4f5b3a]/20 sm:text-[160px] md:text-[280px] lg:text-[400px]">
          {data.brandName}
        </span>
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="mb-4 font-serif text-3xl text-foreground">{data.brandName}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {data.description[locale as Locale] || texts.description}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href={data.socialLinks.facebook || socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={data.socialLinks.instagram || socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={data.socialLinks.tiktok || socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground/60 boty-shadow boty-transition hover:text-foreground"
                aria-label="TikTok"
              >
                <Music2 className="w-4 h-4" />
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

          {/* Useful Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{texts.links}</h3>
            <ul className="space-y-3">
              {links.links.map((link) => (
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
            © {new Date().getFullYear()} {data.brandName}. {data.copyright[locale as Locale] || texts.copyright}.
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
