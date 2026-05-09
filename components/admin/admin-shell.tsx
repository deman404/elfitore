"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  LayoutDashboard,
  Lock,
  Package,
  Search,
  Shapes,
  SlidersHorizontal,
} from "lucide-react"
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
    totalCategories: 0,
    activeCategories: 0,
    catalogValue: 0,
    loading: true,
  })

  useEffect(() => {
    const loadStats = async () => {
      const [{ data: productData }, { data: categoryData }] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("product_categories").select("id, active"),
      ])

      const products = ((productData ?? []) as CatalogProductRow[]).map(normalizeProductRow)
      const categories = (categoryData ?? []) as Array<{ id: number; active?: boolean }>

      setStats({
        totalProducts: products.length,
        oilCount: products.filter((product) => product.category === "oil").length,
        olivesCount: products.filter((product) => product.category === "olives").length,
        totalCategories: categories.length,
        activeCategories: categories.filter((category) => category.active !== false).length,
        catalogValue: products.reduce((sum, product) => sum + product.price, 0),
        loading: false,
      })
    }

    void loadStats()
  }, [supabase])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,119,242,0.12),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] text-foreground">
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/96 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3 font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
              <span className="text-lg font-black">E</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">Admin console</div>
              <div className="text-base font-medium">{title}</div>
            </div>
          </Link>

          <div className="hidden flex-1 lg:block">
            <label className="flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 text-white/90">
              <Search className="h-4 w-4 shrink-0" />
              <span className="text-sm">{description}</span>
            </label>
          </div>

          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Site
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[260px_minmax(0,1fr)_320px] xl:px-8">
        <aside className="hidden h-fit space-y-4 xl:sticky xl:top-[76px] xl:block">
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1877F2]">Workspace</div>
              <p className="mt-1 text-sm text-slate-500">Manage catalog, structure, and access from one place.</p>
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
                        ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
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

          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Quick actions</div>
                <p className="mt-1 text-xs text-slate-500">Useful shortcuts for daily admin work.</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-3 space-y-2">
              <Link
                href="/admin/addProduct"
                className="group flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <span>Create a product</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
              </Link>
              <Link
                href="/admin/categories"
                className="group flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <span>Manage categories</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
              </Link>
              <Link
                href="/admin/parameters"
                className="group flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <span>Update settings</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
              </Link>
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 grid gap-4 xl:hidden">
            <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1877F2]">Menu</div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = item.section === current

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
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
              <InfoRow label="Categories" value={stats.loading ? "..." : `${stats.activeCategories}/${stats.totalCategories}`} compact />
            </section>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
            {children}
          </div>
        </section>

        <aside className="hidden space-y-4 xl:sticky xl:top-[76px] xl:block xl:h-fit">
          <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Catalog pulse</div>
                <p className="mt-1 text-xs text-slate-500">A quick read on how the store is structured today.</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                Live
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <InfoRow label="Products" value={stats.loading ? "..." : `${stats.totalProducts}`} />
              <InfoRow label="Categories" value={stats.loading ? "..." : `${stats.activeCategories}/${stats.totalCategories}`} />
              <InfoRow label="Catalog value" value={stats.loading ? "..." : `DH ${stats.catalogValue}`} />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-4 text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)]">
            <div className="text-sm font-semibold">Operational note</div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              This workspace is built for fast catalog updates. Product and category changes sync with Supabase, while this shell keeps the UI focused on the work.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80">
              <CircleDollarSign className="h-4 w-4 text-emerald-400" />
              Store value: {stats.loading ? "..." : `DH ${stats.catalogValue}`}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function InfoRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 ${
        compact ? "py-2.5" : "py-3"
      }`}
    >
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}
