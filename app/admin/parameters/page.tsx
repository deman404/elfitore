import { redirect } from "next/navigation"

export default function AdminParametersRedirect() {
  redirect("/admin/settings")
}
