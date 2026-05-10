"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronRight, Loader2, ReceiptText, Search, ShoppingBag } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type WebOrderRow = {
  id: number
  reference: string | null
  channel: string
  payment_method: string
  delivery_method: string
  delivery_city: string
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
      .select(
        "id, reference, channel, payment_method, delivery_method, delivery_city, shipping_amount, status, customer_full_name, customer_email, customer_phone, customer_address, customer_city, customer_postal_code, customer_country, notes, subtotal, total, created_at"
      )
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
      order.delivery_method,
      order.delivery_city,
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
    <AdminShell current="orders" title="Orders" description="Review storefront WhatsApp and COD orders saved from the website.">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Storefront orders</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Orders captured from the website
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                WhatsApp and COD checkouts are saved here even when the customer finishes the conversation in another tab or app.
              </p>
            </div>

            <div className="grid gap-3">
              <MiniStat label="Orders loaded" value={loading ? "..." : String(orders.length)} />
              <MiniStat label="Total value" value={loading ? "..." : `DH ${totalRevenue.toFixed(2)}`} />
              <MiniStat label="Newest order" value={loading ? "..." : (orders[0]?.reference ?? "None")} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent orders</h2>
              <p className="mt-1 text-sm text-slate-500">Open any order to inspect the customer details and line items.</p>
            </div>

            <label className="block w-full space-y-2 sm:max-w-sm">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Reference, customer, notes..."
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
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading recent orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="text-sm text-slate-700">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{order.reference ?? "Pending"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.status}</p>
                      </td>
                      <td className="px-4 py-4">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-4">{formatLabel(order.channel)}</td>
                      <td className="px-4 py-4">{formatLabel(order.payment_method)}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{order.delivery_method || "Not set"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.delivery_city || "No city"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{order.customer_full_name || "Anonymous"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.customer_phone || order.customer_email || "No contact details"}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        DH {toNumber(order.total).toFixed(2)}
                        <p className="mt-1 text-xs font-normal text-slate-400">
                          Shipping DH {toNumber(order.shipping_amount).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => void openOrder(order)} className="gap-2">
                          View
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
              Order details
            </SheetTitle>
            <SheetDescription>
              {selectedOrder?.reference ?? "Select an order"} and its saved items.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedOrder ? (
              <div className="space-y-6">
                <section className="grid gap-3 sm:grid-cols-2">
                  <MiniCard label="Reference" value={selectedOrder.reference ?? "Pending"} />
                  <MiniCard label="Created" value={new Date(selectedOrder.created_at).toLocaleString()} />
                  <MiniCard label="Channel" value={formatLabel(selectedOrder.channel)} />
                  <MiniCard label="Payment" value={formatLabel(selectedOrder.payment_method)} />
                  <MiniCard label="Delivery" value={selectedOrder.delivery_method || "Not set"} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Customer</h3>
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
                    ].filter(Boolean).join(" - ") || "No delivery address provided."}
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">Items</h3>
                      <p className="mt-1 text-xs text-slate-500">Products saved with this storefront order.</p>
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
                              Loading items...
                            </td>
                          </tr>
                        ) : selectedItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                              No items found.
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
                  <MiniCard label="Subtotal" value={`DH ${toNumber(selectedOrder.subtotal).toFixed(2)}`} />
                  <MiniCard label="Shipping" value={`DH ${toNumber(selectedOrder.shipping_amount).toFixed(2)}`} />
                  <MiniCard label="Total" value={`DH ${toNumber(selectedOrder.total).toFixed(2)}`} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">Notes</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedOrder.notes || "No notes added."}</p>
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
    </AdminShell>
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
