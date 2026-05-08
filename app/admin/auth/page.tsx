import { AdminLoginForm } from "@/components/admin/admin-login-form"

export default function AdminAuthPage({
  searchParams,
}: {
  searchParams?: {
    next?: string
  }
}) {
  return <AdminLoginForm nextPath={searchParams?.next || "/admin"} />
}

