import { useLanguage } from '@/components/language-context'
import type { Locale } from '@/i18n.config'

type Messages = typeof import('@/messages/en.json')

const translations: Record<Locale, Messages> = {
  en: require('@/messages/en.json'),
  fr: require('@/messages/fr.json'),
  ar: require('@/messages/ar.json'),
}

export function useTranslations() {
  const { locale } = useLanguage()
  return translations[locale]
}
