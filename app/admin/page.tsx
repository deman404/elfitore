"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Box,
  FileText,
  Layers,
  Package,
  Palette,
  ReceiptText,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  Truck,
} from "lucide-react"
import { canAccessAdminSection, type AdminAccessSnapshot } from "@/lib/admin-access"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"
import { DEFAULT_FREE_SHIPPING_THRESHOLD, fetchSiteSettings, formatDhAmount } from "@/lib/site-settings"

type RecentOrder = {
  id: number
  reference: string | null
  customer_full_name: string
  status: string
  total: string | number
  created_at: string
}

export default function AdminPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [webOrdersCount, setWebOrdersCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [access, setAccess] = useState<AdminAccessSnapshot | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError("")

      const [
        { data: productsData, error: productsError },
        ordersCountResult,
        { data: ordersData },
        settings,
      ] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: false }),
        supabase.from("web_orders").select("id", { count: "exact", head: true }),
        supabase
          .from("web_orders")
          .select("id, reference, customer_full_name, status, total, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        fetchSiteSettings(),
      ])

      if (productsError) {
        setError(`Erreur de chargement : ${productsError.message}`)
        setProducts([])
      } else {
        setProducts(((productsData ?? []) as CatalogProductRow[]).map(normalizeProductRow))
      }

      setWebOrdersCount(ordersCountResult.count ?? 0)
      setRecentOrders((ordersData ?? []) as RecentOrder[])
      setFreeShippingThreshold(settings.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD)
      setLoading(false)
    }

    void loadDashboard()
  }, [supabase])

  useEffect(() => {
    const loadAccess = async () => {
      const response = await fetch("/api/admin/me")
      const data = (await response.json().catch(() => ({}))) as AdminAccessSnapshot & { error?: string }
      if (response.ok) setAccess(data)
    }
    void loadAccess()
  }, [])

  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const outOfStockCount = products.filter((p) => p.stock <= 0).length
  const catalogValue = products.reduce((sum, p) => sum + p.price, 0)
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length

  const stats = [
    { label: "Produits", value: totalProducts, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "En stock", value: totalStock, icon: Box, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Commandes", value: webOrdersCount, icon: ShoppingBag, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Valeur catalogue", value: `DH ${catalogValue.toLocaleString()}`, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
    {
      label: "Livraison offerte",
      value: freeShippingThreshold > 0 ? `${formatDhAmount(freeShippingThreshold)}+` : "Gratuit",
      icon: Truck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ]

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {/* Welcome + Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bienvenue dans l'administration</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gérez votre boutique, suivez les commandes et mettez à jour votre catalogue en un seul endroit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickLink href="/admin/addProduct" label="Produit" icon={Package} />
            <QuickLink href="/admin/blogs" label="Blog" icon={Sparkles} />
            <QuickLink href="/admin/pages" label="Pages" icon={FileText} />
            <QuickLink href="/admin/sell-point" label="Vente" icon={BadgeDollarSign} />
            <QuickLink href="/admin/orders" label="Commandes" icon={ReceiptText} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "—" : stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {!loading && (outOfStockCount > 0 || lowStockCount > 0) ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">Alertes stock</p>
              <p className="mt-0.5 text-sm text-amber-800">
                {outOfStockCount > 0 && `${outOfStockCount} produit${outOfStockCount > 1 ? "s" : ""} en rupture de stock. `}
                {lowStockCount > 0 && `${lowStockCount} produit${lowStockCount > 1 ? "s" : ""} avec stock faible (≤ 5).`}
              </p>
              <Link
                href="/admin/addProduct"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                Gérer les produits <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Recent Orders */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Commandes récentes</h3>
                <p className="text-xs text-slate-500">Les 5 dernières commandes en ligne</p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#2271b1] transition hover:bg-[#2271b1]/5"
              >
                Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Chargement...</div>
              ) : recentOrders.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Aucune commande pour le moment</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {order.reference || `#${order.id}`}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer_full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">DH {order.total}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Produits récents</h3>
                <p className="text-xs text-slate-500">Les derniers articles ajoutés au catalogue</p>
              </div>
              <Link
                href="/admin/addProduct"
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#2271b1] transition hover:bg-[#2271b1]/5"
              >
                Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Chargement...</div>
              ) : products.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Aucun produit</div>
              ) : (
                products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{product.name.en}</span>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                          {product.category}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{product.description.en}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.stock <= 0
                            ? "bg-red-50 text-red-700"
                            : product.stock <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {product.stock <= 0 ? "Rupture" : `${product.stock} en stock`}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-slate-900">DH {product.price}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Actions rapides</h3>
              <p className="text-xs text-slate-500">Accès direct aux outils fréquemment utilisés</p>
            </div>
            <div className="divide-y divide-slate-100">
              <ActionRow
                href="/admin/addProduct"
                icon={Package}
                label="Ajouter un produit"
                description="Créer un nouvel article dans le catalogue"
                show={canAccessAdminSection(access, "products")}
              />
              <ActionRow
                href="/admin/categories"
                icon={Layers}
                label="Gérer les catégories"
                description="Organiser la structure du catalogue"
                show={canAccessAdminSection(access, "categories")}
              />
              <ActionRow
                href="/admin/sell-point"
                icon={BadgeDollarSign}
                label="Point de vente"
                description="Encaisser une vente en magasin"
                show={canAccessAdminSection(access, "sell-point")}
              />
              <ActionRow
                href="/admin/orders"
                icon={ReceiptText}
                label="Commandes"
                description="Consulter et traiter les commandes"
                show={canAccessAdminSection(access, "orders")}
              />
              <ActionRow
                href="/admin/theme"
                icon={Palette}
                label="Personnaliser le thème"
                description="Modifier l'apparence du site"
                show={canAccessAdminSection(access, "theme")}
              />
              <ActionRow
                href="/admin/settings"
                icon={SlidersHorizontal}
                label="Paramètres"
                description="Configurer la boutique"
                show={canAccessAdminSection(access, "settings")}
              />
              <ActionRow
                href="/admin/users"
                icon={Users}
                label="Utilisateurs"
                description="Gérer l'équipe et les permissions"
                show={canAccessAdminSection(access, "users")}
              />
            </div>
          </div>

          {/* Store Health */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Santé de la boutique</h3>
              <p className="text-xs text-slate-500">Aperçu des indicateurs clés</p>
            </div>
            <div className="space-y-3 p-5">
              <HealthBar
                label="Stock disponible"
                value={totalProducts - outOfStockCount}
                max={totalProducts}
                tone={outOfStockCount > 0 ? "warning" : "success"}
                loading={loading}
              />
              <HealthBar
                label="Commandes ce mois"
                value={webOrdersCount}
                max={Math.max(webOrdersCount, 10)}
                tone="info"
                loading={loading}
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Ruptures</p>
                  <p className={`mt-1 text-lg font-semibold ${outOfStockCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                    {loading ? "—" : outOfStockCount}
                  </p>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Stock faible</p>
                  <p className={`mt-1 text-lg font-semibold ${lowStockCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                    {loading ? "—" : lowStockCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Summary */}
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <h3 className="font-semibold">Résumé du catalogue</h3>
            <p className="mt-1 text-xs text-white/60">Vue d'ensemble des produits</p>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="text-sm text-white/40">Chargement...</div>
              ) : products.length === 0 ? (
                <div className="text-sm text-white/40">Aucun produit</div>
              ) : (
                products.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-white/80">{product.name.en}</span>
                    <span className="shrink-0 font-medium text-white">DH {product.price}</span>
                  </div>
                ))
              )}
            </div>
            <Link
              href="/admin/addProduct"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Voir le catalogue complet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Package }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-violet-50 text-violet-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  }
  const labels: Record<string, string> = {
    pending: "En attente",
    processing: "En cours",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status}
    </span>
  )
}

function ActionRow({
  href,
  icon: Icon,
  label,
  description,
  show,
}: {
  href: string
  icon: typeof Package
  label: string
  description: string
  show: boolean
}) {
  if (!show) return null
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  )
}

function HealthBar({
  label,
  value,
  max,
  tone,
  loading,
}: {
  label: string
  value: number
  max: number
  tone: "success" | "warning" | "info"
  loading: boolean
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const barColor =
    tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-blue-500"

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{loading ? "—" : `${value} / ${max}`}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
