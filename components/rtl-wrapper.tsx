'use client'

import { useLanguage } from '@/components/language-context'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

export function RtlWrapper({ children }: { children: ReactNode }) {
  const { locale } = useLanguage()

  useEffect(() => {
    const htmlElement = document.documentElement
    if (locale === 'ar') {
      htmlElement.setAttribute('dir', 'rtl')
      htmlElement.setAttribute('lang', 'ar')
      htmlElement.classList.add('rtl')
    } else {
      htmlElement.setAttribute('dir', 'ltr')
      htmlElement.setAttribute('lang', locale === 'fr' ? 'fr' : 'en')
      htmlElement.classList.remove('rtl')
    }
  }, [locale])

  return <>{children}</>
}
