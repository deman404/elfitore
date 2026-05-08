'use client'

import { useLanguage } from './language-context'
import { localeLabels, locales } from '@/i18n.config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import type { Locale } from '@/i18n.config'

const labels: Record<Locale, { change: string }> = {
  en: { change: 'Change language' },
  fr: { change: 'Changer la langue' },
  ar: { change: 'تغيير اللغة' }
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const t = labels[locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition text-sm font-medium"
          aria-label={t.change}
        >
          <Globe className="w-4 h-4" />
          <span>{localeLabels[locale]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(lang => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLocale(lang)}
            className={locale === lang ? 'bg-muted' : ''}
          >
            {localeLabels[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
