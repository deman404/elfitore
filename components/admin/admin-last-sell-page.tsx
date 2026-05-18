"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Loader2, ReceiptText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type SaleRow = {
  id: number
  reference: string | null
  payment_method: string
  notes: string
  cashier_email: string
  subtotal: string | number
  total: string | number
  created_at: string
}

type SaleItemRow = {
  id: number
  sale_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: string | number
  line_total: string | number
}

type Props = {
  initialReference?: string
}

function formatPaymentMethod(value: string) {
  const labels: Record<string, string> = {
    cash: "Cash",
    card: "Card",
    mobile: "Mobile money",
    other: "Other",
  }

  return labels[value] ?? value
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value)
}

export function AdminLastSellPage({ initialReference }: Props) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [sales, setSales] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null)
  const [selectedItems, setSelectedItems] = useState<SaleItemRow[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState("")

  const loadSales = async () => {
    setLoading(true)
    setError("")

    const { data, error: queryError } = await supabase
      .from("sales")
      .select("id, reference, payment_method, notes, cashier_email, subtotal, total, created_at")
      .order("created_at", { ascending: false })
      .limit(20)

    if (queryError) {
      setSales([])
      setError(`Impossible de charger les ventes : ${queryError.message}`)
    } else {
      setSales((data ?? []) as SaleRow[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadSales()
  }, [supabase])

  useEffect(() => {
    if (!initialReference || loading || sales.length === 0) {
      return
    }

    const match = sales.find((sale) => sale.reference === initialReference)

    if (match) {
      void openSale(match)
    }
  }, [initialReference, loading, sales])

  const filteredSales = sales.filter((sale) => {
    const haystack = `${sale.reference ?? ""} ${sale.payment_method} ${sale.cashier_email} ${sale.notes}`.toLowerCase()
    return !query.trim() || haystack.includes(query.trim().toLowerCase())
  })

  const openSale = async (sale: SaleRow) => {
    setSelectedSale(sale)
    setSelectedItems([])
    setDetailsError("")
    setDetailsOpen(true)
    setDetailsLoading(true)

    const { data, error: itemsError } = await supabase
      .from("sale_items")
      .select("id, sale_id, product_id, product_name, quantity, unit_price, line_total")
      .eq("sale_id", sale.id)
      .order("id", { ascending: true })

    if (itemsError) {
      setDetailsError(`Impossible de charger les articles de vente : ${itemsError.message}`)
      setSelectedItems([])
    } else {
      setSelectedItems((data ?? []) as SaleItemRow[])
    }

    setDetailsLoading(false)
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0)

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Historique des ventes</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Les dernières ventes dans un seul tableau
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Cliquez sur une ligne pour ouvrir le reçu complet dans un panneau, avec les articles et les totaux.
              </p>
            </div>

            <div className="grid gap-3">
              <MiniStat label="Ventes chargées" value={loading ? "..." : String(sales.length)} />
              <MiniStat label="Chiffre total" value={loading ? "..." : `DH ${totalRevenue.toFixed(2)}`} />
              <MiniStat label="Dernière vente" value={loading ? "..." : (sales[0]?.reference ?? "Aucune")} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Ventes récentes</h2>
              <p className="mt-1 text-sm text-slate-500">Ouvrez le panneau à droite pour la vente sélectionnée.</p>
            </div>

            <label className="block w-full space-y-2 sm:max-w-sm">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Recherche</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Référence, caisse, notes..."
                  className="admin-input pl-9"
                />
              </div>
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Créée</th>
                  <th className="px-4 py-3">Paiement</th>
                  <th className="px-4 py-3">Caissier</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Ouvrir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      Chargement des ventes récentes...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      Aucune vente trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="text-sm text-slate-700">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{sale.reference ?? "En attente"}</p>
                        <p className="mt-1 text-xs text-slate-400">{sale.notes || "Aucune note"}</p>
                      </td>
                      <td className="px-4 py-4">{new Date(sale.created_at).toLocaleString()}</td>
                      <td className="px-4 py-4">{formatPaymentMethod(sale.payment_method)}</td>
                      <td className="px-4 py-4">{sale.cashier_email || "Unknown"}</td>
                      <td className="px-4 py-4 font-semibold text-slate-950">DH {toNumber(sale.total).toFixed(2)}</td>
                      <td className="px-4 py-4 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => void openSale(sale)} className="gap-2">
                          Voir
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <SheetTitle className="flex items-center gap-2 text-slate-950">
              <ReceiptText className="h-5 w-5" />
              Détails de la vente
            </SheetTitle>
            <SheetDescription>
              {selectedSale?.reference ?? "Sélectionnez une vente"} et ses articles de reçu.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedSale ? (
              <div className="space-y-6">
                <section className="grid gap-3 sm:grid-cols-2">
                  <MiniCard label="Référence" value={selectedSale.reference ?? "En attente"} />
                  <MiniCard label="Créée" value={new Date(selectedSale.created_at).toLocaleString()} />
                  <MiniCard label="Paiement" value={formatPaymentMethod(selectedSale.payment_method)} />
                  <MiniCard label="Caissier" value={selectedSale.cashier_email || "Inconnu"} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">Articles</h3>
                      <p className="mt-1 text-xs text-slate-500">Produits inclus dans cette vente.</p>
                    </div>
                    {detailsLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : null}
                  </div>

                  {detailsError ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {detailsError}
                    </div>
                  ) : null}

                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Unit</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {detailsLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                              Chargement des articles...
                            </td>
                          </tr>
                        ) : selectedItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                              Aucun article trouvé.
                            </td>
                          </tr>
                        ) : (
                          selectedItems.map((item) => (
                            <tr key={item.id} className="text-sm text-slate-700">
                              <td className="px-4 py-4">
                                <p className="font-medium text-slate-950">{item.product_name}</p>
                                <p className="mt-1 text-xs text-slate-400">Product ID {item.product_id}</p>
                              </td>
                              <td className="px-4 py-4 font-medium text-slate-950">{item.quantity}</td>
                              <td className="px-4 py-4">DH {toNumber(item.unit_price).toFixed(2)}</td>
                              <td className="px-4 py-4 text-right font-semibold text-slate-950">
                                DH {toNumber(item.line_total).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <MiniCard label="Subtotal" value={`DH ${toNumber(selectedSale.subtotal).toFixed(2)}`} />
                  <MiniCard label="Total" value={`DH ${toNumber(selectedSale.total).toFixed(2)}`} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Notes</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedSale.notes || "No notes added."}</p>
                </section>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
                Choose a sale from the table to view its receipt details.
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <Button asChild className="w-full">
              <Link href="/admin/sell-point" className="inline-flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sell Point
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}
