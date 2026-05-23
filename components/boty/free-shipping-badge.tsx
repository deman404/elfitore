"use client"

import { useEffect, useState } from "react"
import { Truck } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"
import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  fetchSiteSettings,
  formatDhAmount,
} from "@/lib/site-settings"

const translations = {
  en: {
    label: "Free shipping over",
    alwaysFree: "Free shipping on all orders",
  },
  fr: {
    label: "Livraison offerte dès",
    alwaysFree: "Livraison offerte sur toutes les commandes",
  },
  ar: {
    label: "شحن مجاني ابتداءً من",
    alwaysFree: "شحن مجاني على جميع الطلبات",
  },
} as const

export function FreeShippingBadge() {
  const { locale, isRTL } = useLanguage()
  const [threshold, setThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD)

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      setThreshold(settings.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD)
    }

    void loadSettings()
  }, [])

  const t = translations[locale as Locale]

  return (
    <div
      className={`w-full animate-blur-in opacity-0 ${isRTL ? "text-right" : "text-left"}`}
      style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
    >
      <div className="flex items-center justify-between gap-3 border border-white/25 bg-white/92 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.16)] backdrop-blur-md">
        <span className={`flex min-w-0 items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Truck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">
            {threshold > 0 ? `${t.label} ${formatDhAmount(threshold)}` : t.alwaysFree}
          </span>
        </span>
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700/80">
          Shipping
        </span>
      </div>
    </div>
  )
}
