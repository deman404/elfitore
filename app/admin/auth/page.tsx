import { AdminLoginForm } from "@/components/admin/admin-login-form"

export default async function AdminAuthPage({
  searchParams,
}: {
  searchParams?: Promise<{
    next?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  return <AdminLoginForm nextPath={resolvedSearchParams?.next || "/admin"} />
}

