"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/i18n.config"
import { cn } from "@/lib/utils"

const defaultLabels: Record<Locale, string> = {
  en: "Shop Now",
  fr: "Acheter Maintenant",
  ar: "تسوق الآن",
}

export function ShopNowButton({
  href = "/shop",
  label,
  className,
}: {
  href?: string
  label?: string
  className?: string
}) {
  const { locale } = useLanguage()
  const localizedLocale = locale as Locale

  return (
    <Button asChild className={cn("w-full rounded-full px-7 py-4 text-sm tracking-wide sm:w-auto sm:px-8", className)}>
      <Link href={href} className="group inline-flex items-center gap-3">
        <span>{label ?? defaultLabels[localizedLocale]}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  )
}
