import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { buildAllowedAdminSections, type AdminAccessSnapshot } from "@/lib/admin-access"
import { normalizeAdminUser, type AdminUserPermissionRow } from "@/lib/admin-users"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    const admin = getSupabaseAdminClient()
    const { data: row, error } = await (admin
      .from("admin_users")
      .select("*")
      .eq("user_id", authData.user.id)
      .maybeSingle() as any)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const normalized = row ? normalizeAdminUser(row as AdminUserPermissionRow) : null
    const accessSnapshot = normalized
      ? {
          user: normalized,
          allowedSections: [],
          canManageUsers: normalized.canManageUsers,
          canManageSales: normalized.canManageSales,
          canManageProducts: normalized.canManageProducts,
          canManageCategories: normalized.canManageCategories,
          canManageTheme: normalized.canManageTheme,
          canManageSettings: normalized.canManageSettings,
        }
      : null
    const access: AdminAccessSnapshot = {
      user: normalized,
      allowedSections: buildAllowedAdminSections(accessSnapshot),
      canManageUsers: normalized?.canManageUsers ?? false,
      canManageSales: normalized?.canManageSales ?? false,
      canManageProducts: normalized?.canManageProducts ?? false,
      canManageCategories: normalized?.canManageCategories ?? false,
      canManageTheme: normalized?.canManageTheme ?? false,
      canManageSettings: normalized?.canManageSettings ?? false,
    }

    return NextResponse.json(access)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load admin access."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
