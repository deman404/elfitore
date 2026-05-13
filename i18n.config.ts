export type Locale = 'en' | 'fr' | 'ar'

export const defaultLocale: Locale = 'fr'
export const locales: Locale[] = ['en', 'fr', 'ar']

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

export const isRTL = (locale: Locale) => locale === 'ar'
