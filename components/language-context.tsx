'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Locale } from '@/i18n.config'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const isRTL = locale === 'ar'

  useEffect(() => {
    const savedLocale = window.localStorage.getItem('locale')
    if (savedLocale === 'en' || savedLocale === 'fr' || savedLocale === 'ar') {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem('locale', nextLocale)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
