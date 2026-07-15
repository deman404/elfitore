"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type AuthContextValue = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthDialogOpen: boolean
  setIsAuthDialogOpen: (open: boolean) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  isAuthDialogOpen: false,
  setIsAuthDialogOpen: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

   supabase.auth.getUser().then(({ data, error }) => {
  if (error && error.message !== "Auth session missing!") {
    console.error("getUser error:", error.message)
  }
  setUser(data.user ?? null)
  setLoading(false)
})
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) setIsAuthDialogOpen(false) // auto-close dialog on successful login
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, isAuthDialogOpen, setIsAuthDialogOpen }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}