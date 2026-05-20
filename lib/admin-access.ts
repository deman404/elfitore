import type { AdminUserSummary } from "@/lib/admin-users"

export type AdminSection =
  | "dashboard"
  | "auth"
  | "blog"
  | "pages"
  | "products"
  | "categories"
  | "sell-point"
  | "last-sell"
  | "orders"
  | "users"
  | "settings"
  | "theme"

export type AdminAccessSnapshot = {
  user: AdminUserSummary | null
  allowedSections: AdminSection[]
  canManageUsers: boolean
  canManageSales: boolean
  canManageProducts: boolean
  canManageCategories: boolean
  canManageTheme: boolean
  canManageSettings: boolean
}

export function canAccessAdminSection(access: AdminAccessSnapshot | null, section: AdminSection) {
  if (!access) return false

  switch (section) {
    case "dashboard":
    case "auth":
    case "blog":
    case "pages":
      return true
    case "users":
      return access.canManageUsers
    case "sell-point":
    case "last-sell":
    case "orders":
      return access.canManageSales
    case "products":
      return access.canManageProducts
    case "categories":
      return access.canManageCategories
    case "theme":
      return access.canManageTheme
    case "settings":
      return access.canManageSettings
    default:
      return false
  }
}

export function buildAllowedAdminSections(access: AdminAccessSnapshot | null): AdminSection[] {
  const sections: AdminSection[] = ["dashboard", "auth", "blog", "pages"]

  if (!access) return sections

  if (access.canManageSales) {
    sections.push("sell-point", "last-sell", "orders")
  }

  if (access.canManageUsers) {
    sections.push("users")
  }

  if (access.canManageProducts) {
    sections.push("products")
  }

  if (access.canManageCategories) {
    sections.push("categories")
  }

  if (access.canManageTheme) {
    sections.push("theme")
  }

  if (access.canManageSettings) {
    sections.push("settings")
  }

  return sections
}
