"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { LogIn, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"

const STORAGE_KEY = "elfitor-auth-dismissed"

const copy = {
  en: {
    title: "Welcome to El Fitore",
    description: "Sign in to save your favorites, track orders, and enjoy a personalized experience.",
    google: "Continue with Google",
    guest: "Continue as Guest",
    subtitle: "Premium Moroccan Olive Oil",
  },
  fr: {
    title: "Bienvenue chez El Fitore",
    description: "Connectez-vous pour enregistrer vos favoris, suivre vos commandes et profiter d'une expérience personnalisée.",
    google: "Continuer avec Google",
    guest: "Continuer en tant qu'invité",
    subtitle: "Huile d'Olive Marocaine Premium",
  },
  ar: {
    title: "مرحباً بك في El Fitore",
    description: "قم بتسجيل الدخول لحفظ المفضلات وتتبع الطلبات والاستمتاع بتجربة مخصصة.",
    google: "المتابعة مع Google",
    guest: "المتابعة كضيف",
    subtitle: "زيت الزيتون المغربي الممتاز",
  },
} as const

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { locale } = useLanguage()
  const text = copy[locale]

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleGoogle = async () => {
    setLoading(true)
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleGuest = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#f6f7f7]">
            <Image src="/logo.png" alt="El Fitore" width={48} height={48} className="object-contain" />
          </div>
          <DialogTitle className="text-xl font-semibold">{text.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {text.subtitle}
          </DialogDescription>
        </DialogHeader>

        <p className="text-center text-sm text-muted-foreground">
          {text.description}
        </p>

        <div className="mt-2 flex flex-col gap-3">
          <Button
            onClick={() => void handleGoogle()}
            disabled={loading}
            className="w-full gap-2 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {text.google}
          </Button>

          <Button
            onClick={handleGuest}
            variant="ghost"
            className="w-full gap-2 text-slate-600 hover:text-slate-900"
          >
            <User className="h-4 w-4" />
            {text.guest}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
