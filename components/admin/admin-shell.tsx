"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, LayoutDashboard, Lock, Package, Search, Shapes, SlidersHorizontal } from "lucide-react"
import type { ReactNode } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow } from "@/lib/catalog"

type AdminSection = "dashboard" | "auth" | "products" | "categories" | "parameters"

const navItems: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
  section: AdminSection
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { href: "/admin/addProduct", label: "Products", icon: Package, section: "products" },
  { href: "/admin/categories", label: "Categories", icon: Shapes, section: "categories" },
  { href: "/admin/parameters", label: "Parameters", icon: SlidersHorizontal, section: "parameters" },
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
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [stats, setStats] = useState({
    totalProducts: 0,
    oilCount: 0,
    olivesCount: 0,
    catalogValue: 0,
    loading: true,
  })

  useEffect(() => {
    const loadStats = async () => {
      const { data } = await supabase.from("products").select("*")
      const products = ((data ?? []) as CatalogProductRow[]).map(normalizeProductRow)

      setStats({
        totalProducts: products.length,
        oilCount: products.filter((product) => product.category === "oil").length,
        olivesCount: products.filter((product) => product.category === "olives").length,
        catalogValue: products.reduce((sum, product) => sum + product.price, 0),
        loading: false,
      })
    }

    void loadStats()
  }, [supabase])

  return (
    <main className="min-h-screen bg-[#f0f2f5] text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1877F2] text-white shadow-[0_8px_30px_rgba(24,119,242,0.18)]">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3 font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1877F2] shadow-sm">
              <span className="text-lg font-black">f</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm uppercase tracking-[0.24em] text-white/75">Admin</div>
              <div className="text-base">{title}</div>
            </div>
          </Link>

          <div className="hidden flex-1 lg:block">
            <label className="flex h-11 items-center gap-3 rounded-full bg-white/15 px-4 text-white/90 backdrop-blur">
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-sm">{description}</span>
            </label>
          </div>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Site
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full  gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:px-8">
        <aside className="hidden h-fit space-y-4 lg:sticky lg:top-[76px] lg:block">
          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1877F2]">Menu</div>
              <p className="mt-1 text-sm text-slate-500">Navigate your admin workspace</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = item.section === current

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#1877F2] text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-semibold text-slate-900">Quick access</div>
            <div className="mt-3 space-y-2">
              <Link href="/admin/addProduct" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                Create a product
              </Link>
              <Link href="/admin/categories" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                Manage categories
              </Link>
              <Link href="/admin/parameters" className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100">
                Update parameters
              </Link>
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 grid gap-4 lg:hidden">
            <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1877F2]">Menu</div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = item.section === current

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[#1877F2] text-white shadow-sm"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <InfoRow label="Products" value={stats.loading ? "..." : `${stats.totalProducts}`} compact />
              <InfoRow label="Catalog" value={stats.loading ? "..." : `DH ${stats.catalogValue}`} compact />
            </section>
          </div>

          <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
            {children}
          </div>
        </section>

        <aside className="hidden space-y-4 lg:sticky lg:top-[76px] lg:block lg:h-fit">
          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-semibold text-slate-900">Stock alerts</div>
            <div className="mt-3 space-y-3">
              <InfoRow label="Low stock items" value={stats.loading ? "..." : `${getLowStockCount(stats.oilCount, stats.olivesCount)} items`} />
              <InfoRow label="Oil catalog" value={stats.loading ? "..." : `${stats.oilCount} items`} />
              <InfoRow label="Olive catalog" value={stats.loading ? "..." : `${stats.olivesCount} items`} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-semibold text-slate-900">Quick stats</div>
            <div className="mt-3 space-y-3">
              <InfoRow label="Total products" value={stats.loading ? "..." : `${stats.totalProducts}`} />
              <InfoRow label="Catalog value" value={stats.loading ? "..." : `DH ${stats.catalogValue}`} />
              <InfoRow label="Admin mode" value="Facebook-style" />
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function getLowStockCount(oilCount: number, olivesCount: number) {
  // Without inventory data yet, surface a small operational indicator based on the smaller catalog segment.
  return Math.min(oilCount, olivesCount)
}

function InfoRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 ${compact ? "py-2.5" : "py-3"}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}
