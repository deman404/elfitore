import { NextResponse } from "next/server"
import { fetchElfitorCatalog } from "@/lib/elfitor"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const catalog = await fetchElfitorCatalog()
    return NextResponse.json(catalog)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import Elfitor products."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
