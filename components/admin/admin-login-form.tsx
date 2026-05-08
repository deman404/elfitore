"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Lock, Loader2, ShieldCheck } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type AuthState = {
  email: string
  password: string
}

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [form, setForm] = useState<AuthState>({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (field: keyof AuthState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const signIn = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      window.location.assign(nextPath)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,91,58,0.08),_transparent_35%),linear-gradient(180deg,#faf8f3_0%,#f3efe7_100%)] px-4 py-12 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-border bg-white/85 p-8 shadow-lg shadow-black/5 backdrop-blur">
          <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="mt-5 font-serif text-3xl text-foreground">Admin login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your email and password.</p>

          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                value={form.email}
                onChange={handleChange("email")}
                type="email"
                autoComplete="email"
                className="admin-input"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Password</span>
              <input
                value={form.password}
                onChange={handleChange("password")}
                type="password"
                autoComplete="current-password"
                className="admin-input"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  )
}

