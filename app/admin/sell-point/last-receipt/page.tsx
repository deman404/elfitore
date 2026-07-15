import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLastSellPage } from "@/components/admin/admin-last-sell-page"

type PageProps = {
  searchParams?: Promise<{
    reference?: string
  }>
}

export default async function LastReceiptPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    redirect(`/admin/auth?next=/admin/sell-point/last-receipt${resolvedSearchParams?.reference ? `?reference=${encodeURIComponent(resolvedSearchParams.reference)}` : ""}`)
  }

  return <AdminLastSellPage initialReference={resolvedSearchParams?.reference} />
}
