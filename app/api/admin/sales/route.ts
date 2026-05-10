import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type SaleItemInput = {
  productId: number
  quantity: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "You must sign in before creating a sale." }, { status: 401 })
    }

    const body = (await request.json()) as {
      paymentMethod?: string
      notes?: string
      items?: SaleItemInput[]
    }

    const paymentMethod = String(body.paymentMethod ?? "cash").trim() || "cash"
    const notes = String(body.notes ?? "").trim()
    const items = Array.isArray(body.items)
      ? body.items
          .map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          }))
          .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && Number.isInteger(item.quantity) && item.quantity > 0)
      : []

    if (items.length === 0) {
      return NextResponse.json({ error: "Add at least one item to create a sale." }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data, error } = (await (admin as any).rpc("create_pos_sale", {
      p_payment_method: paymentMethod,
      p_notes: notes,
      p_cashier_email: authData.user.email ?? "",
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    })) as {
      data:
        | Array<{
            sale_id: number
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

    const sale = Array.isArray(data) ? data[0] : null

    if (!sale) {
      return NextResponse.json({ error: "Sale was created, but no receipt data was returned." }, { status: 500 })
    }

    return NextResponse.json({
      saleId: sale.sale_id,
      reference: sale.reference,
      subtotal: Number(sale.subtotal),
      total: Number(sale.total),
      createdAt: sale.created_at,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create sale."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
