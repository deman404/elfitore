export type AdminUserRole = "owner" | "admin" | "manager" | "cashier" | "viewer"

export type AdminUserPermissionRow = {
  user_id: string
  email: string
  full_name: string
  role: AdminUserRole | string
  can_manage_users: boolean
  can_manage_sales: boolean
  can_manage_products: boolean
  can_manage_categories: boolean
  can_manage_theme: boolean
  can_manage_settings: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdminUserSummary = {
  id: string
  email: string
  fullName: string
  role: AdminUserRole | string
  canManageUsers: boolean
  canManageSales: boolean
  canManageProducts: boolean
  canManageCategories: boolean
  canManageTheme: boolean
  canManageSettings: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const ADMIN_ROLE_LABELS: Record<AdminUserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
  viewer: "Viewer",
}

export function getRoleDefaults(role: AdminUserRole) {
  switch (role) {
    case "owner":
      return {
        canManageUsers: true,
        canManageSales: true,
        canManageProducts: true,
        canManageCategories: true,
        canManageTheme: true,
        canManageSettings: true,
      }
    case "admin":
      return {
        canManageUsers: true,
        canManageSales: true,
        canManageProducts: true,
        canManageCategories: true,
        canManageTheme: true,
        canManageSettings: true,
      }
    case "manager":
      return {
        canManageUsers: false,
        canManageSales: true,
        canManageProducts: true,
        canManageCategories: true,
        canManageTheme: false,
        canManageSettings: false,
      }
    case "cashier":
      return {
        canManageUsers: false,
        canManageSales: true,
        canManageProducts: false,
        canManageCategories: false,
        canManageTheme: false,
        canManageSettings: false,
      }
    case "viewer":
    default:
      return {
        canManageUsers: false,
        canManageSales: false,
        canManageProducts: false,
        canManageCategories: false,
        canManageTheme: false,
        canManageSettings: false,
      }
  }
}

export function normalizeAdminUser(row: AdminUserPermissionRow): AdminUserSummary {
  return {
    id: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    canManageUsers: row.can_manage_users,
    canManageSales: row.can_manage_sales,
    canManageProducts: row.can_manage_products,
    canManageCategories: row.can_manage_categories,
    canManageTheme: row.can_manage_theme,
    canManageSettings: row.can_manage_settings,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
