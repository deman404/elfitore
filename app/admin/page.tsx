"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Database, Lock, Package2, PencilLine, ShieldCheck, Sparkles, Users2 } from "lucide-react"
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

  return (
    <AdminShell
      current="dashboard"
      title="Dashboard"
      description="Search admin tools and manage your store from one place."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StateCard
            icon={Package2}
            label="Total products"
            value={loading ? "..." : `${totalProducts}`}
            note="Live catalog items from Supabase"
            tone="blue"
          />
          <StateCard icon={Sparkles} label="Oils" value={loading ? "..." : `${oilCount}`} note="Olive oil products" tone="green" />
          <StateCard icon={ShieldCheck} label="Olives" value={loading ? "..." : `${olivesCount}`} note="Olive selections" tone="amber" />
          <StateCard
            icon={Users2}
            label="Catalog value"
            value={loading ? "..." : `DH ${catalogValue}`}
            note="Combined list price"
            tone="slate"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <ComposerCard />

            <div className="grid gap-4 md:grid-cols-2">
              <ActionCard
                title="Authentication"
                description="Sign in with Supabase and keep the admin area protected."
                href="/admin/auth"
                icon={Lock}
              />
              <ActionCard
                title="Products"
                description="Create, edit, and remove products from Supabase."
                href="/admin/addProduct"
                icon={Database}
              />
            </div>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recent catalog activity</h3>
                  <p className="text-sm text-slate-500">A feed-like view of live products.</p>
                </div>
                <PencilLine className="h-5 w-5 text-[#1877F2]" />
              </div>

              <div className="mt-4 space-y-3">
                {(loading ? [] : products.slice(0, 5)).map((product) => (
                  <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
                        <Users2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">{product.name.en}</p>
                          <span className="text-xs font-semibold text-slate-500">DH {product.price}</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{product.description.en}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-slate-900">Catalog snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">
                This list is pulled from the products table in Supabase.
              </p>

              <div className="mt-4 space-y-3">
                {(loading ? [] : products.slice(0, 6)).map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{product.name.en}</p>
                        <p className="text-sm text-slate-500">{product.description.en}</p>
                      </div>
                      <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-xs font-semibold text-[#1877F2]">
                        DH {product.price}
                      </span>
                    </div>
                  </div>
                ))}
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
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{note}</p>
    </div>
  )
}

function ComposerCard() {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2]/10 font-semibold text-[#1877F2]">
          A
        </div>
        <div className="flex-1">
          <div className="rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-500">
            What do you want to manage today?
          </div>
        </div>
      </div>
    </section>
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
      className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex rounded-2xl bg-[#1877F2]/10 p-3 text-[#1877F2]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
