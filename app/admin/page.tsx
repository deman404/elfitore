"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BadgeCheck, BadgeDollarSign, CircleDollarSign, Database, Lock, Package2, ReceiptText, Shapes, ShieldCheck, Sparkles, Users } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { canAccessAdminSection, type AdminAccessSnapshot } from "@/lib/admin-access"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [webOrdersCount, setWebOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [access, setAccess] = useState<AdminAccessSnapshot | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError("")

      const { data, error: queryError } = await supabase.from("products").select("*").order("id", { ascending: false })
      let ordersCount = 0
      try {
        const { count } = await supabase.from("web_orders").select("id", { count: "exact", head: true })
        ordersCount = count ?? 0
      } catch {
        ordersCount = 0
      }

      if (queryError) {
        setError(`Could not load products from Supabase: ${queryError.message}`)
        setProducts([])
      } else {
        setProducts(((data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      }

      setWebOrdersCount(ordersCount)

      setLoading(false)
    }

    void loadDashboard()
  }, [supabase])

  useEffect(() => {
    const loadAccess = async () => {
      const response = await fetch("/api/admin/me")
      const data = (await response.json().catch(() => ({}))) as AdminAccessSnapshot & { error?: string }

      if (response.ok) {
        setAccess(data)
      }
    }

    void loadAccess()
  }, [])

  const totalProducts = products.length
  const oilCount = products.filter((product) => product.category === "oil").length
  const olivesCount = products.filter((product) => product.category === "olives").length
  const catalogValue = products.reduce((sum, product) => sum + product.price, 0)
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const outOfStockCount = products.filter((product) => product.stock <= 0).length
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
                Supabase connecté
              </div>

              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Gardez le catalogue en mouvement avec un tableau de bord vraiment utile au quotidien.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  Ce panneau affiche le catalogue en direct, sa structure active et les chemins les plus rapides pour ajouter du stock ou mettre à jour la boutique.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/addProduct"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Ajouter un produit
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Gérer les catégories
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {canAccessAdminSection(access, "theme") ? (
                  <Link
                    href="/admin/theme"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Thème
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {canAccessAdminSection(access, "sell-point") ? (
                  <Link
                    href="/admin/sell-point"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Point de vente
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {canAccessAdminSection(access, "settings") ? (
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Paramètres de la boutique
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {canAccessAdminSection(access, "users") ? (
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Utilisateurs
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MiniPill label="Produits" value={loading ? "..." : `${totalProducts}`} />
              <MiniPill label="Valeur du catalogue" value={loading ? "..." : `DH ${catalogValue}`} />
              <MiniPill label="Catégories actives" value={loading ? "..." : `${categoryBreakdown.length}`} />
              <MiniPill label="Unités en stock" value={loading ? "..." : `${totalStock}`} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StateCard
            icon={Package2}
            label="Produits totaux"
            value={loading ? "..." : `${totalProducts}`}
            note="Articles actifs dans Supabase"
            tone="blue"
          />
          <StateCard icon={Sparkles} label="Produits huile" value={loading ? "..." : `${oilCount}`} note="Articles d'huile d'olive" tone="green" />
          <StateCard icon={ShieldCheck} label="Produits olives" value={loading ? "..." : `${olivesCount}`} note="Sélections d'olives" tone="amber" />
          <StateCard
            icon={CircleDollarSign}
            label="Catalog value"
            value={loading ? "..." : `DH ${catalogValue}`}
            note="Prix total du catalogue"
            tone="slate"
          />
          <StateCard
            icon={Package2}
            label="Rupture de stock"
            value={loading ? "..." : `${outOfStockCount}`}
            note="Produits sans stock"
            tone="amber"
          />
          <StateCard
            icon={BadgeDollarSign}
            label="Sell point"
            value="Open"
            note="Encaissement rapide en magasin"
            tone="blue"
          />
          <StateCard
            icon={ReceiptText}
            label="Commandes web"
            value={loading ? "..." : `${webOrdersCount}`}
            note="Commandes WhatsApp et paiement à la livraison"
            tone="green"
          />
          <StateCard
            icon={Users}
            label="Utilisateurs"
            value="Gérer"
            note="Rôles et permissions"
            tone="slate"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Activité récente du catalogue</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Vue en direct des produits les plus récents récupérés depuis Supabase.
                </p>
              </div>
              <Link href="/admin/addProduct" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1877F2]">
                Ouvrir le gestionnaire de produits
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
              <h2 className="text-xl font-semibold text-slate-950">Raccourcis opérationnels</h2>
              <p className="mt-1 text-sm text-slate-500">Les endroits les plus utiles après avoir consulté le tableau de bord.</p>

              <div className="mt-5 grid gap-3">
                {canAccessAdminSection(access, "theme") ? (
                  <ActionCard
                    title="Thème"
                    description="Modifier le média principal et le texte de la page d'accueil."
                    href="/admin/theme"
                    icon={Sparkles}
                  />
                ) : null}
                {canAccessAdminSection(access, "sell-point") ? (
                  <ActionCard
                    title="Point de vente"
                    description="Ouvrir l'interface d'encaissement en magasin."
                    href="/admin/sell-point"
                    icon={BadgeDollarSign}
                  />
                ) : null}
                {canAccessAdminSection(access, "sell-point") ? (
                  <ActionCard
                    title="Commandes"
                    description="Consulter les commandes WhatsApp et paiement à la livraison."
                    href="/admin/orders"
                    icon={ReceiptText}
                  />
                ) : null}
                <ActionCard
                  title="Authentification"
                  description="Vérifier la connexion Supabase et l'accès admin protégé."
                  href="/admin/auth"
                  icon={Lock}
                />
                {canAccessAdminSection(access, "products") ? (
                  <ActionCard
                    title="Produits"
                    description="Créer, modifier et supprimer des produits du catalogue."
                    href="/admin/addProduct"
                    icon={Database}
                  />
                ) : null}
                {canAccessAdminSection(access, "categories") ? (
                  <ActionCard
                    title="Catégories"
                    description="Garder une structure produit propre et cohérente."
                    href="/admin/categories"
                    icon={Shapes}
                  />
                ) : null}
                {canAccessAdminSection(access, "users") ? (
                  <ActionCard
                    title="Utilisateurs"
                    description="Gérer les administrateurs et les permissions."
                    href="/admin/users"
                    icon={Users}
                  />
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
              <h2 className="text-lg font-semibold">Répartition du catalogue</h2>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Un aperçu rapide des familles de produits qui portent l'assortiment actuellement.
              </p>

              <div className="mt-4 space-y-3">
                {categoryBreakdown.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    Aucun produit chargé pour le moment.
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
