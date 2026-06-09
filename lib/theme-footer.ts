import type { Locale } from "@/i18n.config"

export type LocalizedText = Record<Locale, string>

export type ThemeFooterLink = {
  name: LocalizedText
  href: string
}

export type ThemeFooterData = {
  brandName: string
  description: LocalizedText
  shopLinks: ThemeFooterLink[]
  usefulLinks: ThemeFooterLink[]
  supportLinks: ThemeFooterLink[]
  socialLinks: {
    facebook: string
    instagram: string
    tiktok: string
  }
  copyright: LocalizedText
}

export const DEFAULT_THEME_FOOTER: ThemeFooterData = {
  brandName: "El Fitore",
  description: {
    en: "Premium Moroccan olive oils and olives, bringing authentic flavors and quality to your table.",
    fr: "Huiles d'olive et olives marocaines premium, apportant des saveurs authentiques et une qualité à votre table.",
    ar: "زيوت زيتون وزيتون مغربي فاخر، يجلب النكهات الأصلية والجودة إلى طاولتك.",
  },
  shopLinks: [
    {
      name: {
        en: "All Products",
        fr: "Tous les produits",
        ar: "جميع المنتجات",
      },
      href: "/shop",
    },
    {
      name: {
        en: "Olive Oils",
        fr: "Huiles d'olive",
        ar: "زيوت الزيتون",
      },
      href: "/shop?category=oil",
    },
    {
      name: {
        en: "Olives",
        fr: "Olives",
        ar: "الزيتون",
      },
      href: "/shop?category=olives",
    },
    {
      name: {
        en: "Gift Sets",
        fr: "Coffrets cadeaux",
        ar: "مجموعات هدايا",
      },
      href: "/shop",
    },
    {
      name: {
        en: "New Arrivals",
        fr: "Nouveautés",
        ar: "الوصول الجديد",
      },
      href: "/shop",
    },
  ],
  usefulLinks: [
    {
      name: {
        en: "Home",
        fr: "Accueil",
        ar: "الرئيسية",
      },
      href: "/",
    },
    {
      name: {
        en: "Shop",
        fr: "Boutique",
        ar: "المتجر",
      },
      href: "/shop",
    },
    {
      name: {
        en: "Blog",
        fr: "Blog",
        ar: "المدونة",
      },
      href: "/blog",
    },
    {
      name: {
        en: "Contact",
        fr: "Contact",
        ar: "اتصل بنا",
      },
      href: "/contact",
    },
    {
      name: {
        en: "FAQ",
        fr: "FAQ",
        ar: "الأسئلة الشائعة",
      },
      href: "/faq",
    },
    {
      name: {
        en: "Shipping",
        fr: "Livraison",
        ar: "التوصيل",
      },
      href: "/shipping",
    },
  ],
  supportLinks: [
    {
      name: {
        en: "Contact Us",
        fr: "Nous contacter",
        ar: "اتصل بنا",
      },
      href: "/contact",
    },
    {
      name: {
        en: "FAQ",
        fr: "FAQ",
        ar: "الأسئلة الشائعة",
      },
      href: "/faq",
    },
    {
      name: {
        en: "Shipping",
        fr: "Livraison",
        ar: "التوصيل",
      },
      href: "/shipping",
    },
    {
      name: {
        en: "Returns",
        fr: "Retours",
        ar: "المرتجعات",
      },
      href: "/returns",
    },
  ],
  socialLinks: {
    facebook: "https://www.facebook.com/share/1CQYK9qNjd/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/elfitor.officiel?igsh=MTdnOHBiaW1na3FpaQ%3D%3D&utm_source=qr",
    tiktok: "https://www.tiktok.com/@elfitor.officiel?_r=1&_t=ZS-96WkEg14VE4",
  },
  copyright: {
    en: "All rights reserved",
    fr: "Tous droits réservés",
    ar: "جميع الحقوق محفوظة",
  },
}

export function fetchThemeFooter() {
  return fetch("/api/theme-footer", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_FOOTER
    return (await response.json()) as ThemeFooterData
  })
}

export function normalizeThemeFooterData(value: unknown): ThemeFooterData {
  const data = isObject(value) ? value : {}

  return {
    brandName: stringOrDefault(data.brandName, DEFAULT_THEME_FOOTER.brandName),
    description: localizedText(data.description, DEFAULT_THEME_FOOTER.description),
    shopLinks: normalizeLinks(data.shopLinks, DEFAULT_THEME_FOOTER.shopLinks),
    usefulLinks: normalizeLinks(data.usefulLinks, DEFAULT_THEME_FOOTER.usefulLinks),
    supportLinks: normalizeLinks(data.supportLinks, DEFAULT_THEME_FOOTER.supportLinks),
    socialLinks: {
      facebook: stringOrDefault(data.socialLinks && isObject(data.socialLinks) ? data.socialLinks.facebook : undefined, DEFAULT_THEME_FOOTER.socialLinks.facebook),
      instagram: stringOrDefault(data.socialLinks && isObject(data.socialLinks) ? data.socialLinks.instagram : undefined, DEFAULT_THEME_FOOTER.socialLinks.instagram),
      tiktok: stringOrDefault(data.socialLinks && isObject(data.socialLinks) ? data.socialLinks.tiktok : undefined, DEFAULT_THEME_FOOTER.socialLinks.tiktok),
    },
    copyright: localizedText(data.copyright, DEFAULT_THEME_FOOTER.copyright),
  }
}

export function normalizeThemeFooterInput(input: ThemeFooterData): ThemeFooterData {
  return {
    brandName: stringOrDefault(input.brandName, DEFAULT_THEME_FOOTER.brandName),
    description: localizedText(input.description, DEFAULT_THEME_FOOTER.description),
    shopLinks: normalizeLinks(input.shopLinks, DEFAULT_THEME_FOOTER.shopLinks),
    usefulLinks: normalizeLinks(input.usefulLinks, DEFAULT_THEME_FOOTER.usefulLinks),
    supportLinks: normalizeLinks(input.supportLinks, DEFAULT_THEME_FOOTER.supportLinks),
    socialLinks: {
      facebook: stringOrDefault(input.socialLinks?.facebook, DEFAULT_THEME_FOOTER.socialLinks.facebook),
      instagram: stringOrDefault(input.socialLinks?.instagram, DEFAULT_THEME_FOOTER.socialLinks.instagram),
      tiktok: stringOrDefault(input.socialLinks?.tiktok, DEFAULT_THEME_FOOTER.socialLinks.tiktok),
    },
    copyright: localizedText(input.copyright, DEFAULT_THEME_FOOTER.copyright),
  }
}

function normalizeLinks(value: unknown, fallback: ThemeFooterLink[]) {
  const list = Array.isArray(value) && value.length > 0 ? value : fallback
  return list.map((item, index) => ({
    name: localizedText(isObject(item) ? item.name : undefined, fallback[index]?.name ?? fallback[0].name),
    href: stringOrDefault(isObject(item) ? item.href : undefined, fallback[index]?.href ?? fallback[0].href),
  }))
}

function localizedText(value: unknown, fallback: LocalizedText) {
  const data = isObject(value) ? value : {}
  return {
    en: stringOrDefault(data.en, fallback.en),
    fr: stringOrDefault(data.fr, fallback.fr),
    ar: stringOrDefault(data.ar, fallback.ar),
  }
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
