"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BadgeDollarSign, Loader2, Minus, Plus, ReceiptText, Search, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { normalizeProductRow, type CatalogCategoryRow, type CatalogProductRow, type NormalizedProduct } from "@/lib/catalog"

type PosCartItem = {
  productId: number
  name: string
  image: string
  price: number
  quantity: number
  stock: number
  category: string
}

type ReceiptState = {
  reference: string
  subtotal: number
  total: number
  createdAt: string
}

export function AdminSellPointPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [products, setProducts] = useState<NormalizedProduct[]>([])
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([])
  const [cart, setCart] = useState<PosCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState("")
  const [receipt, setReceipt] = useState<ReceiptState | null>(null)

  const loadCatalog = async () => {
    setLoading(true)
    setStatus("")

    const [productsResult, categoriesResult] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase
        .from("product_categories")
        .select("id, name, slug, active")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ])

    if (productsResult.error) {
      setProducts([])
      setStatus(`Could not load products: ${productsResult.error.message}`)
    } else {
      setProducts(((productsResult.data ?? []) as CatalogProductRow[]).map(normalizeProductRow))
    }

    if (categoriesResult.error) {
      setCategories([])
    } else {
      setCategories((categoriesResult.data ?? []) as CatalogCategoryRow[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadCatalog()
  }, [supabase])

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.dbId, product] as const)),
    [products]
  )

  useEffect(() => {
    setCart((current) =>
      current
        .map((item) => {
          const product = productMap.get(item.productId)
          if (!product || product.stock <= 0) {
            return null
          }

          return {
            ...item,
            stock: product.stock,
            quantity: Math.min(item.quantity, product.stock),
            price: product.price,
            name: product.name.en,
            image: product.image,
            category: product.category,
          }
        })
        .filter((item): item is PosCartItem => Boolean(item))
    )
  }, [productMap])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const haystack = `${product.name.en} ${product.description.en} ${product.category}`.toLowerCase()
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase())
    return matchesCategory && matchesSearch
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product: NormalizedProduct) => {
    if (product.stock <= 0) return

    setCart((current) => {
      const existing = current.find((item) => item.productId === product.dbId)
      if (!existing) {
        return [
          ...current,
          {
            productId: product.dbId,
            name: product.name.en,
            image: product.image,
            price: product.price,
            quantity: 1,
            stock: product.stock,
            category: product.category,
          },
        ]
      }

      return current.map((item) =>
        item.productId === product.dbId
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock), stock: product.stock }
          : item
      )
    })
  }

  const updateQuantity = (productId: number, nextQuantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, nextQuantity), item.stock) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const completeSale = async () => {
    if (cart.length === 0) {
      setStatus("Add at least one product to create a sale.")
      return
    }

    setProcessing(true)
    setStatus("")
    setReceipt(null)

    const response = await fetch("/api/admin/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentMethod,
        notes,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })

    const data = (await response.json().catch(() => ({}))) as {
      error?: string
      reference?: string
      subtotal?: number
      total?: number
      createdAt?: string
    }

    if (!response.ok) {
      setStatus(data.error ?? "Could not complete the sale.")
      setProcessing(false)
      return
    }

    setReceipt({
      reference: data.reference ?? "",
      subtotal: data.subtotal ?? subtotal,
      total: data.total ?? subtotal,
      createdAt: data.createdAt ?? new Date().toISOString(),
    })

    setCart([])
    setNotes("")
    await loadCatalog()
    setProcessing(false)
    setStatus("Sale completed and stock updated.")
  }

  const stockSummary = useMemo(
    () => ({
      total: products.reduce((sum, product) => sum + product.stock, 0),
      low: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
      out: products.filter((product) => product.stock <= 0).length,
    }),
    [products]
  )

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">POS portal</p>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Sell products fast, with stock automatically reduced at checkout.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Search the catalog, build a basket, and finalize a sale without leaving the admin area.
              </p>
            </div>

            <div className="grid gap-3">
              <MiniStat label="Inventory units" value={loading ? "..." : String(stockSummary.total)} />
              <MiniStat label="Low stock" value={loading ? "..." : String(stockSummary.low)} />
              <MiniStat label="Out of stock" value={loading ? "..." : String(stockSummary.out)} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Catalog</h3>
                <p className="mt-1 text-sm text-slate-500">Search products and add them directly to the sale.</p>
              </div>

              <div className="grid gap-3 sm:min-w-[24rem] sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Search</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="admin-input pl-9"
                      placeholder="Search products"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="admin-input"
                  >
                    <option value="all">All products</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
                    <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No products match the current filters.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <article key={product.dbId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                      <img src={product.image || "/placeholder.svg"} alt={product.name.en} className="h-full w-full object-cover" />
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock <= 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {product.stock <= 0 ? "Out of stock" : `${product.stock} units`}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-950">{product.name.en}</h4>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description.en}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                          DH {product.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{product.category}</span>
                        <Button
                          type="button"
                          size="sm"
                          disabled={product.stock <= 0}
                          onClick={() => addToCart(product)}
                          className="gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <BadgeDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">Current sale</h3>
                  <p className="mt-1 text-sm text-slate-500">{itemCount} items in the basket</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Add products from the catalog to start a sale.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-slate-950">{item.name}</h4>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{item.category}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-slate-400 transition hover:text-red-600"
                              aria-label="Remove from sale"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="px-3 py-1.5 text-slate-700"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-8 px-2 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="px-3 py-1.5 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-slate-950">DH {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Subtotal</span>
                  <span>DH {subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-lg font-semibold">
                  <span>Total</span>
                  <span>DH {subtotal.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h3 className="text-xl font-semibold text-slate-950">Payment</h3>
              <p className="mt-1 text-sm text-slate-500">Choose how the customer paid and save the transaction.</p>

              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Method</span>
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="admin-input">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile money</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="admin-input min-h-24 resize-y"
                    placeholder="Optional notes for this sale"
                  />
                </label>

                <Button
                  type="button"
                  onClick={completeSale}
                  disabled={processing || cart.length === 0}
                  className="w-full gap-2"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
                  {processing ? "Processing..." : "Complete sale"}
                </Button>

                <Button type="button" variant="outline" onClick={clearCart} disabled={cart.length === 0} className="w-full">
                  Clear sale
                </Button>
              </div>
            </section>

            {receipt ? (
              <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-semibold">Last Sell</h3>
                <p className="mt-1 text-sm">Reference: {receipt.reference}</p>
                <p className="mt-1 text-sm">Subtotal: DH {receipt.subtotal.toFixed(2)}</p>
                <p className="mt-1 text-sm">Total: DH {receipt.total.toFixed(2)}</p>
                <p className="mt-1 text-sm">Time: {new Date(receipt.createdAt).toLocaleString()}</p>
                <div className="mt-4">
                  <Link
                    href={`/admin/sell-point/last-receipt?reference=${encodeURIComponent(receipt.reference)}`}
                    className="inline-flex items-center rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    View last sell
                  </Link>
                </div>
              </section>
            ) : null}

            {status ? (
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                {status}
              </section>
            ) : null}
          </aside>
        </div>
      </div>
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
