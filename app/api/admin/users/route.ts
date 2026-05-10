import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { AdminUserPermissionRow, AdminUserRole } from "@/lib/admin-users"
import { getRoleDefaults, normalizeAdminUser } from "@/lib/admin-users"

export const dynamic = "force-dynamic"

type UpdateBody = {
  userId?: string
  email?: string
  password?: string
  fullName?: string
  role?: AdminUserRole
  canManageUsers?: boolean
  canManageSales?: boolean
  canManageProducts?: boolean
  canManageCategories?: boolean
  canManageTheme?: boolean
  canManageSettings?: boolean
  isActive?: boolean
}

async function getCurrentAccess() {
  const supabase = await createSupabaseServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    return { ok: false as const, error: "You must sign in before managing users." }
  }

  const admin = getSupabaseAdminClient()
  const { data: currentRow, error: permissionsError } = await (admin
    .from("admin_users")
    .select("user_id, role, can_manage_users")
    .eq("user_id", authData.user.id)
    .maybeSingle() as any)

  if (permissionsError) {
    return { ok: false as const, error: permissionsError.message }
  }

  const canManageUsers = !currentRow ? true : currentRow.role === "owner" || currentRow.role === "admin" || currentRow.can_manage_users

  if (!canManageUsers) {
    return { ok: false as const, error: "You do not have permission to manage users." }
  }

  return { ok: true as const, userId: authData.user.id }
}

export async function GET() {
  try {
    const access = await getCurrentAccess()

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 })
    }

    const admin = getSupabaseAdminClient()
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const userIds = (authUsers.users ?? []).map((user) => user.id)
    const { data: permissionRows, error: permissionsError } = await admin
      .from("admin_users")
      .select("*")
      .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"])

    if (permissionsError) {
      return NextResponse.json({ error: permissionsError.message }, { status: 500 })
    }

    const permissionMap = new Map<string, AdminUserPermissionRow>()
    for (const row of (permissionRows ?? []) as AdminUserPermissionRow[]) {
      permissionMap.set(row.user_id, row)
    }

    const users = (authUsers.users ?? []).map((user) => {
      const permissionRow = permissionMap.get(user.id)

      if (permissionRow) {
        return normalizeAdminUser(permissionRow)
      }

      return {
        id: user.id,
        email: user.email ?? "",
        fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
        role: "viewer",
        canManageUsers: false,
        canManageSales: false,
        canManageProducts: false,
        canManageCategories: false,
        canManageTheme: false,
        canManageSettings: false,
        isActive: true,
        createdAt: user.created_at ?? "",
        updatedAt: user.updated_at ?? user.created_at ?? "",
      }
    })

    return NextResponse.json({
      users,
      canManageUsers: true,
      currentUserId: access.userId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load users."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await getCurrentAccess()

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 })
    }

    const body = (await request.json()) as UpdateBody

    const admin = getSupabaseAdminClient()
    const role = body.role ?? "viewer"
    const defaults = getRoleDefaults(role)

    if (!body.userId) {
      const email = String(body.email ?? "").trim()
      const password = String(body.password ?? "").trim()
      const fullName = String(body.fullName ?? "").trim()

      if (!email) {
        return NextResponse.json({ error: "Missing email." }, { status: 400 })
      }

      if (!password) {
        return NextResponse.json({ error: "Missing password." }, { status: 400 })
      }

      const { data: createData, error: createError } = await (admin as any).auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }

      const createdUser = createData?.user

      if (!createdUser?.id) {
        return NextResponse.json({ error: "User was created, but no user record was returned." }, { status: 500 })
      }

      const payload: Record<string, unknown> = {
        user_id: createdUser.id,
        email,
        full_name: fullName,
        role,
        can_manage_users: body.canManageUsers ?? defaults.canManageUsers,
        can_manage_sales: body.canManageSales ?? defaults.canManageSales,
        can_manage_products: body.canManageProducts ?? defaults.canManageProducts,
        can_manage_categories: body.canManageCategories ?? defaults.canManageCategories,
        can_manage_theme: body.canManageTheme ?? defaults.canManageTheme,
        can_manage_settings: body.canManageSettings ?? defaults.canManageSettings,
        is_active: body.isActive ?? true,
      }

      const { data, error } = await (admin
        .from("admin_users")
        .upsert(payload as any, { onConflict: "user_id" })
        .select("*")
        .single() as any)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        user: normalizeAdminUser(data as AdminUserPermissionRow),
        created: true,
      })
    }

    const payload: Record<string, unknown> = {
      user_id: body.userId,
      email: String(body.email ?? "").trim(),
      full_name: String(body.fullName ?? "").trim(),
      role,
      can_manage_users: body.canManageUsers ?? defaults.canManageUsers,
      can_manage_sales: body.canManageSales ?? defaults.canManageSales,
      can_manage_products: body.canManageProducts ?? defaults.canManageProducts,
      can_manage_categories: body.canManageCategories ?? defaults.canManageCategories,
      can_manage_theme: body.canManageTheme ?? defaults.canManageTheme,
      can_manage_settings: body.canManageSettings ?? defaults.canManageSettings,
      is_active: body.isActive ?? true,
    }

    const { data, error } = await (admin
      .from("admin_users")
      .upsert(payload as any, { onConflict: "user_id" })
      .select("*")
      .single() as any)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: normalizeAdminUser(data as AdminUserPermissionRow) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save user permissions."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
