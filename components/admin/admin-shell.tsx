"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BadgeDollarSign,
  LayoutDashboard,
  Lock,
  ReceiptText,
  Palette,
  Package,
  PanelLeftOpen,
  Shapes,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { canAccessAdminSection, type AdminAccessSnapshot, type AdminSection } from "@/lib/admin-access"
import { getSupabaseBrowserClient } from "@/lib/supabase"

const navItems: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
  section: AdminSection
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { href: "/admin/sell-point", label: "Sell Point", icon: BadgeDollarSign, section: "sell-point" },
  { href: "/admin/sell-point/last-receipt", label: "Last Sell", icon: ReceiptText, section: "last-sell" },
  { href: "/admin/users", label: "Users", icon: Users, section: "users" },
  { href: "/admin/addProduct", label: "Products", icon: Package, section: "products" },
  { href: "/admin/categories", label: "Categories", icon: Shapes, section: "categories" },
  { href: "/admin/theme", label: "Theme", icon: Palette, section: "theme" },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal, section: "settings" },
  { href: "/admin/auth", label: "Auth", icon: Lock, section: "auth" },
]

export function AdminShell({
  children,
  current,
  description,
  title,
}: {
  children: ReactNode
  current: AdminSection
  description: string
  title: string
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [access, setAccess] = useState<AdminAccessSnapshot | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let active = true

    const loadAccess = async () => {
      setAccessLoading(true)

      const response = await fetch("/api/admin/me")
      const data = (await response.json().catch(() => ({}))) as AdminAccessSnapshot & { error?: string }

      if (!active) {
        return
      }

      if (!response.ok) {
        setAccess(null)
      } else {
        setAccess(data)
      }

      setAccessLoading(false)
    }

    void loadAccess()

    return () => {
      active = false
    }
  }, [])

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => canAccessAdminSection(access, item.section)),
    [access]
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/auth")
    router.refresh()
  }

  if (accessLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4 text-slate-700">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm shadow-sm">
          Loading admin access...
        </div>
      </main>
    )
  }

  const canViewCurrentSection = canAccessAdminSection(access, current)

  return (
    <main className="min-h-screen bg-blue-50 text-foreground">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[84vw] max-w-[18rem] border-slate-950 bg-slate-950 p-0 text-white sm:max-w-[19rem]">
          <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
            <SheetTitle className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">El Fitore Admin</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-white/60">
              {title}
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 overflow-y-auto px-3 py-3">
            <SidebarNav current={current} items={visibleNavItems} onNavigate={() => setMobileMenuOpen(false)} />
            <div className="mt-auto border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <Lock className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-950 bg-slate-950 lg:flex">
        <div className="flex h-full w-full flex-col overflow-y-auto p-3">
          <Link href="/admin" className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
              <Store className="h-4 w-4" />
            </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Admin</div>
            <div className="truncate text-sm font-semibold text-white">El Fitore</div>
          </div>
        </Link>

          <div className="mt-3">
            <SidebarNav current={current} items={visibleNavItems} />
          </div>

          <div className="mt-auto border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <Lock className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex w-full items-center gap-2 px-3 py-2 sm:px-4 lg:px-6">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0 border-slate-200 bg-white text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open admin menu"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
            </Button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-950 sm:text-lg">{title}</h1>
              <p className="hidden max-w-2xl text-xs text-slate-500 sm:block">{description}</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Site
              </Link>
            </div>
          </div>
        </header>

        <div className="w-full px-3 py-4 sm:px-4 lg:px-6">
          <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {canViewCurrentSection ? (
              children
            ) : (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <h2 className="text-lg font-semibold">You do not have access to this page</h2>
                <p className="mt-2 text-sm leading-6">
                  Your current role does not allow this section. Use the pages your admin account can access, or contact an owner to update your permissions.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/admin"
                    className="inline-flex items-center rounded-md bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="inline-flex items-center rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}

function SidebarNav({
  current,
  items,
  onNavigate,
}: {
  current: AdminSection
  items: Array<{
    href: string
    label: string
    icon: typeof LayoutDashboard
    section: AdminSection
  }>
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon
        const active = item.section === current
        const isSalesEntry = item.section === "sell-point"
        const isHistoryEntry = item.section === "last-sell"

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-white/10 text-white"
                : isSalesEntry
                  ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25 hover:text-white"
                  : isHistoryEntry
                    ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30 hover:bg-sky-500/25 hover:text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {isSalesEntry ? (
              <span className="ml-auto rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                POS
              </span>
            ) : isHistoryEntry ? (
              <span className="ml-auto rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                History
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
