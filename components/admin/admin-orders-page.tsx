"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronRight, Loader2, ReceiptText, Search, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type WebOrderRow = {
  id: number
  reference: string | null
  channel: string
  payment_method: string
  delivery_method?: string | null
  delivery_city?: string | null
  shipping_amount: string | number
  status: string
  customer_full_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_country: string
  notes: string
  subtotal: string | number
  total: string | number
  created_at: string
}

type WebOrderItemRow = {
  id: number
  web_order_id: number
  product_id: number | null
  product_name: string
  quantity: number
  unit_price: string | number
  line_total: string | number
  image: string
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value)
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getDeliveryLabel(order: WebOrderRow) {
  return order.delivery_city?.trim() || order.delivery_method?.trim() || "Non défini"
}

export function AdminOrdersPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [orders, setOrders] = useState<WebOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WebOrderRow | null>(null)
  const [selectedItems, setSelectedItems] = useState<WebOrderItemRow[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState("")

  const loadOrders = async () => {
    setLoading(true)
    setError("")

    const { data, error: queryError } = await supabase
      .from("web_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (queryError) {
      setOrders([])
      setError(`Could not load orders: ${queryError.message}`)
    } else {
      setOrders((data ?? []) as WebOrderRow[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadOrders()
  }, [supabase])

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.reference,
      order.channel,
      order.payment_method,
      order.delivery_city,
      order.delivery_method,
      order.status,
      order.customer_full_name,
      order.customer_email,
      order.customer_phone,
      order.notes,
    ]
      .join(" ")
      .toLowerCase()

    return !query.trim() || haystack.includes(query.trim().toLowerCase())
  })

  const openOrder = async (order: WebOrderRow) => {
    setSelectedOrder(order)
    setSelectedItems([])
    setDetailsError("")
    setDetailsOpen(true)
    setDetailsLoading(true)

    const { data, error: itemsError } = await supabase
      .from("web_order_items")
      .select("id, web_order_id, product_id, product_name, quantity, unit_price, line_total, image")
      .eq("web_order_id", order.id)
      .order("id", { ascending: true })

    if (itemsError) {
      setDetailsError(`Could not load order items: ${itemsError.message}`)
      setSelectedItems([])
    } else {
      setSelectedItems((data ?? []) as WebOrderItemRow[])
    }

    setDetailsLoading(false)
  }

  const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.total), 0)

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Commandes du site</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Commandes récupérées depuis le site
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Les commandes WhatsApp et paiement à la livraison sont enregistrées ici, même si le client termine la conversation dans un autre onglet ou une autre application.
              </p>
            </div>

            <div className="grid gap-3">
              <MiniStat label="Commandes chargées" value={loading ? "..." : String(orders.length)} />
              <MiniStat label="Valeur totale" value={loading ? "..." : `DH ${totalRevenue.toFixed(2)}`} />
              <MiniStat label="Commande la plus récente" value={loading ? "..." : (orders[0]?.reference ?? "Aucune")} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Commandes récentes</h2>
              <p className="mt-1 text-sm text-slate-500">Ouvrez une commande pour consulter les détails client et les articles.</p>
            </div>

            <label className="block w-full space-y-2 sm:max-w-sm">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Recherche</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Référence, client, notes..."
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
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Paiement</th>
                  <th className="px-4 py-3">Livraison</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Ouvrir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      Chargement des commandes récentes...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="text-sm text-slate-700">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{order.reference ?? "En attente"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.status}</p>
                      </td>
                      <td className="px-4 py-4">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-4">{formatLabel(order.channel)}</td>
                      <td className="px-4 py-4">{formatLabel(order.payment_method)}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{getDeliveryLabel(order)}</p>
                        <p className="mt-1 text-xs text-slate-400">Livraison</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{order.customer_full_name || "Anonymous"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.customer_phone || order.customer_email || "Aucune coordonnée"}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        DH {toNumber(order.total).toFixed(2)}
                        <p className="mt-1 text-xs font-normal text-slate-400">
                          Livraison DH {toNumber(order.shipping_amount).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => void openOrder(order)} className="gap-2">
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
              Détails de la commande
            </SheetTitle>
            <SheetDescription>
              {selectedOrder?.reference ?? "Sélectionnez une commande"} et ses articles enregistrés.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedOrder ? (
              <div className="space-y-6">
                <section className="grid gap-3 sm:grid-cols-2">
                  <MiniCard label="Référence" value={selectedOrder.reference ?? "En attente"} />
                  <MiniCard label="Créée" value={new Date(selectedOrder.created_at).toLocaleString()} />
                  <MiniCard label="Canal" value={formatLabel(selectedOrder.channel)} />
                  <MiniCard label="Paiement" value={formatLabel(selectedOrder.payment_method)} />
                  <MiniCard label="Livraison" value={getDeliveryLabel(selectedOrder)} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Client</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <MiniCard label="Name" value={selectedOrder.customer_full_name || "Anonymous"} />
                    <MiniCard label="Phone" value={selectedOrder.customer_phone || "Not provided"} />
                    <MiniCard label="Email" value={selectedOrder.customer_email || "Not provided"} />
                    <MiniCard label="Location" value={[selectedOrder.customer_city, selectedOrder.customer_country].filter(Boolean).join(", ") || "Not provided"} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {[
                      selectedOrder.customer_address,
                      selectedOrder.customer_postal_code,
                    ].filter(Boolean).join(" - ") || "Aucune adresse de livraison fournie."}
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">Articles</h3>
                      <p className="mt-1 text-xs text-slate-500">Produits enregistrés avec cette commande du site.</p>
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
                                <p className="mt-1 text-xs text-slate-400">{item.product_id ? `Product ID ${item.product_id}` : "No product ID"}</p>
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
                  <MiniCard label="Sous-total" value={`DH ${toNumber(selectedOrder.subtotal).toFixed(2)}`} />
                  <MiniCard label="Livraison" value={`DH ${toNumber(selectedOrder.shipping_amount).toFixed(2)}`} />
                  <MiniCard label="Total" value={`DH ${toNumber(selectedOrder.total).toFixed(2)}`} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Notes</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedOrder.notes || "Aucune note ajoutée."}</p>
                </section>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
                Choose an order from the table to view the saved checkout details.
              </div>
            )}
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
