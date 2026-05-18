"use client"

import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch: render consistently during SSR + initial client render
  if (!mounted) {
    return <AdminShell>{children}</AdminShell>
  }

  // Auth page renders its own full-screen layout without the admin shell
  if (pathname === "/admin/auth") {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
