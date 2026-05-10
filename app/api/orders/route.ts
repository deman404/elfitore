import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { StorefrontOrderInput } from "@/lib/storefront-orders"

export const dynamic = "force-dynamic"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StorefrontOrderInput> & {
      customer?: Partial<StorefrontOrderInput["customer"]>
    }

    const channel = body.channel === "product-page" ? "product-page" : "checkout"
    const paymentMethod = body.paymentMethod === "whatsapp" ? "whatsapp" : "cod"
    const deliveryMethod = typeof body.deliveryMethod === "string" ? body.deliveryMethod.trim() : ""
    const deliveryCity = typeof body.deliveryCity === "string" ? body.deliveryCity.trim() : ""
    const shipping = typeof body.shipping === "number" && Number.isFinite(body.shipping) ? body.shipping : 0
    const customer = body.customer ?? {}
    const items = Array.isArray(body.items)
      ? body.items
          .map((item) => ({
            productId: typeof item.productId === "number" && Number.isFinite(item.productId) ? item.productId : undefined,
            productName: normalizeText(item.productName),
            quantity: Number(item.quantity),
            unitPrice: typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) ? item.unitPrice : undefined,
            image: normalizeText(item.image),
          }))
          .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0)
      : []

    if (items.length === 0) {
      return NextResponse.json({ error: "Add at least one item to create an order." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data, error } = (await (admin as any).rpc("create_web_order", {
      p_channel: channel,
      p_payment_method: paymentMethod,
      p_delivery_method: deliveryMethod,
      p_delivery_city: deliveryCity,
      p_shipping_amount: shipping,
      p_customer_full_name: normalizeText(customer.fullName),
      p_customer_email: normalizeText(customer.email),
      p_customer_phone: normalizeText(customer.phone),
      p_customer_address: normalizeText(customer.address),
      p_customer_city: normalizeText(customer.city),
      p_customer_postal_code: normalizeText(customer.postalCode),
      p_customer_country: normalizeText(customer.country),
      p_notes: normalizeText(body.notes),
      p_items: items.map((item) => ({
        product_id: item.productId ?? null,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? null,
        image: item.image,
      })),
    })) as {
      data:
        | Array<{
            order_id: number
            reference: string
            subtotal: string
            total: string
            created_at: string
          }>
        | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const order = Array.isArray(data) ? data[0] : null

    if (!order) {
      return NextResponse.json({ error: "Order was created, but no receipt data was returned." }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.order_id,
      reference: order.reference,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      createdAt: order.created_at,
      status: "pending",
      channel,
      paymentMethod,
      deliveryMethod,
      deliveryCity,
      shipping,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create order."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
