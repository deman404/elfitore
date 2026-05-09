"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BadgeCheck, CircleDollarSign, Database, Lock, Package2, Shapes, ShieldCheck, Sparkles } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError("")

      const { data, error: queryError } = await supabase.from("products").select("*").order("id", { ascending: false })

      if (queryError) {
        setError(`Could not load products from Supabase: ${queryError.message}`)
        setProducts([])
      } else {
        setProducts(((data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      }

      setLoading(false)
    }

    void loadDashboard()
  }, [supabase])

  const totalProducts = products.length
  const oilCount = products.filter((product) => product.category === "oil").length
  const olivesCount = products.filter((product) => product.category === "olives").length
  const catalogValue = products.reduce((sum, product) => sum + product.price, 0)
  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>()

    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
  }, [products])

  return (
    <AdminShell
      current="dashboard"
      title="Overview"
      description="Track catalog health, launch new products, and keep the store organized."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75">
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
                Supabase connected
              </div>

              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Keep the catalog moving with a dashboard that actually helps you operate it.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  This panel shows the live catalog, the active structure behind it, and the fastest routes to add new inventory or update the store.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/addProduct"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Add product
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Manage categories
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/parameters"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Store settings
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MiniPill label="Products" value={loading ? "..." : `${totalProducts}`} />
              <MiniPill label="Catalog value" value={loading ? "..." : `DH ${catalogValue}`} />
              <MiniPill label="Active categories" value={loading ? "..." : `${categoryBreakdown.length}`} />
              <MiniPill label="Stock view" value={loading ? "..." : `${oilCount + olivesCount} visible`} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StateCard
            icon={Package2}
            label="Total products"
            value={loading ? "..." : `${totalProducts}`}
            note="Live items in Supabase"
            tone="blue"
          />
          <StateCard icon={Sparkles} label="Oil products" value={loading ? "..." : `${oilCount}`} note="Olive oil items" tone="green" />
          <StateCard icon={ShieldCheck} label="Olive products" value={loading ? "..." : `${olivesCount}`} note="Olive selections" tone="amber" />
          <StateCard
            icon={CircleDollarSign}
            label="Catalog value"
            value={loading ? "..." : `DH ${catalogValue}`}
            note="Combined list price"
            tone="slate"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Recent catalog activity</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A live view of the newest products pulled from Supabase.
                </p>
              </div>
              <Link href="/admin/addProduct" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1877F2]">
                Open product manager
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3">
              {(loading ? [] : products.slice(0, 5)).map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">{product.name.en}</p>
                        <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-xs font-semibold text-[#1877F2]">
                          {product.category}
                        </span>
                      </div>
                      <p className="boty-line-clamp-2 mt-1 text-sm leading-6 text-slate-500">{product.description.en}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                        DH {product.price}
                      </div>
                      <Link href="/admin/addProduct" className="text-slate-400 transition hover:text-slate-950">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-xl font-semibold text-slate-950">Operational shortcuts</h2>
              <p className="mt-1 text-sm text-slate-500">The most common places to move after reviewing the dashboard.</p>

              <div className="mt-5 grid gap-3">
                <ActionCard
                  title="Authentication"
                  description="Check the Supabase sign-in flow and protected admin access."
                  href="/admin/auth"
                  icon={Lock}
                />
                <ActionCard
                  title="Products"
                  description="Create, edit, and remove products from the catalog."
                  href="/admin/addProduct"
                  icon={Database}
                />
                <ActionCard
                  title="Categories"
                  description="Keep the product structure clean and consistent."
                  href="/admin/categories"
                  icon={Shapes}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              <h2 className="text-lg font-semibold">Catalog mix</h2>
              <p className="mt-1 text-sm leading-6 text-white/70">
                A quick snapshot of which catalog groups are carrying the assortment right now.
              </p>

              <div className="mt-4 space-y-3">
                {categoryBreakdown.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    No products loaded yet.
                  </div>
                ) : (
                  categoryBreakdown.map(([category, count]) => (
                    <div key={category} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="capitalize text-white/85">{category}</span>
                        <span className="font-semibold text-white">{count}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-emerald-400"
                          style={{ width: `${Math.max(10, Math.min(100, (count / Math.max(totalProducts, 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </AdminShell>
  )
}

function StateCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Package2
  label: string
  value: string
  note: string
  tone: "blue" | "green" | "amber" | "slate"
}) {
  const toneStyles: Record<"blue" | "green" | "amber" | "slate", string> = {
    blue: "bg-[#1877F2]/10 text-[#1877F2]",
    green: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    slate: "bg-slate-500/10 text-slate-600",
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{note}</p>
    </div>
  )
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  icon: typeof Lock
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-950" />
      </div>
    </Link>
  )
}
