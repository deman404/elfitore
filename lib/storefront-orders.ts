export type StorefrontOrderChannel = "checkout" | "product-page"
export type StorefrontPaymentMethod = "cod" | "whatsapp"

export type StorefrontOrderItemInput = {
  productId?: number
  productName?: string
  quantity: number
  unitPrice?: number
  image?: string
}

export type StorefrontCustomerInfo = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

export type StorefrontOrderInput = {
  channel: StorefrontOrderChannel
  paymentMethod: StorefrontPaymentMethod
  deliveryMethod?: string
  deliveryCity?: string
  shipping?: number
  customer: StorefrontCustomerInfo
  items: StorefrontOrderItemInput[]
  notes?: string
}

export type StorefrontOrderRecord = {
  id: number
  reference: string
  channel: StorefrontOrderChannel
  paymentMethod: StorefrontPaymentMethod
  deliveryMethod: string
  deliveryCity: string
  shipping: number
  status: string
  subtotal: number
  total: number
  createdAt: string
  customer: Required<StorefrontCustomerInfo>
  items: Array<{
    productId?: number
    name: string
    quantity: number
    unitPrice: number
    image?: string
  }>
}

const BROWSER_HISTORY_KEY = "el-fitore-storefront-orders"
const MAX_BROWSER_ORDERS = 25

function isBrowser() {
  return typeof window !== "undefined"
}

function safeParse(value: string | null): StorefrontOrderRecord[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is StorefrontOrderRecord => Boolean(item) && typeof item === "object") as StorefrontOrderRecord[]
  } catch {
    return []
  }
}

export function loadBrowserStorefrontOrders() {
  if (!isBrowser()) return []
  return safeParse(window.localStorage.getItem(BROWSER_HISTORY_KEY))
}

export function saveBrowserStorefrontOrder(order: StorefrontOrderRecord) {
  if (!isBrowser()) return

  const current = loadBrowserStorefrontOrders()
  const next = [order, ...current.filter((item) => item.reference !== order.reference)].slice(0, MAX_BROWSER_ORDERS)
  window.localStorage.setItem(BROWSER_HISTORY_KEY, JSON.stringify(next))
}
