"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Loader2, Plus, Search, Shield, ShieldOff, UserPlus, UserRoundCog, Users } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  ADMIN_ROLE_LABELS,
  getRoleDefaults,
  type AdminUserRole,
  type AdminUserSummary,
} from "@/lib/admin-users"

type UsersResponse = {
  users: AdminUserSummary[]
  canManageUsers: boolean
  currentUserId: string
  error?: string
}

type EditingUser = AdminUserSummary & {
  canManageUsers: boolean
  canManageSales: boolean
  canManageProducts: boolean
  canManageCategories: boolean
  canManageTheme: boolean
  canManageSettings: boolean
  isActive: boolean
}

type UserDraft = {
  email: string
  password: string
  fullName: string
  role: AdminUserRole
  canManageUsers: boolean
  canManageSales: boolean
  canManageProducts: boolean
  canManageCategories: boolean
  canManageTheme: boolean
  canManageSettings: boolean
  isActive: boolean
}

const emptyUserDraft = (): UserDraft => {
  const defaults = getRoleDefaults("viewer")
  return {
    email: "",
    password: "",
    fullName: "",
    role: "viewer",
    canManageUsers: defaults.canManageUsers,
    canManageSales: defaults.canManageSales,
    canManageProducts: defaults.canManageProducts,
    canManageCategories: defaults.canManageCategories,
    canManageTheme: defaults.canManageTheme,
    canManageSettings: defaults.canManageSettings,
    isActive: true,
  }
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [canManageUsers, setCanManageUsers] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")
  const [selectedUser, setSelectedUser] = useState<EditingUser | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<UserDraft>(emptyUserDraft())

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    const response = await fetch("/api/admin/users")
    const data = (await response.json().catch(() => ({}))) as UsersResponse

    if (!response.ok) {
      setUsers([])
      setError(data.error ?? "Could not load users.")
      setLoading(false)
      return
    }

    setUsers(data.users ?? [])
    setCanManageUsers(data.canManageUsers)
    setCurrentUserId(data.currentUserId)
    setLoading(false)
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) =>
      `${user.email} ${user.fullName} ${user.role}`.toLowerCase().includes(term)
    )
  }, [search, users])

  const openEditor = (user: AdminUserSummary) => {
    setSelectedUser({
      ...user,
      canManageUsers: user.canManageUsers,
      canManageSales: user.canManageSales,
      canManageProducts: user.canManageProducts,
      canManageCategories: user.canManageCategories,
      canManageTheme: user.canManageTheme,
      canManageSettings: user.canManageSettings,
      isActive: user.isActive,
    })
    setStatus("")
    setSheetOpen(true)
  }

  const openCreateUser = () => {
    setCreateDraft(emptyUserDraft())
    setStatus("")
    setCreateOpen(true)
  }

  const applyRoleDefaults = (role: AdminUserRole) => {
    if (!selectedUser) return

    const defaults = getRoleDefaults(role)
    setSelectedUser((current) =>
      current
        ? {
            ...current,
            role,
            ...defaults,
          }
        : current
    )
  }

  const saveUser = async () => {
    if (!selectedUser) return

    setSaving(true)
    setStatus("")

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        role: selectedUser.role,
        canManageUsers: selectedUser.canManageUsers,
        canManageSales: selectedUser.canManageSales,
        canManageProducts: selectedUser.canManageProducts,
        canManageCategories: selectedUser.canManageCategories,
        canManageTheme: selectedUser.canManageTheme,
        canManageSettings: selectedUser.canManageSettings,
        isActive: selectedUser.isActive,
      }),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string; user?: AdminUserSummary }

    if (!response.ok) {
      setStatus(data.error ?? "Could not save user permissions.")
      setSaving(false)
      return
    }

    if (data.user) {
      setUsers((current) => current.map((user) => (user.id === data.user?.id ? data.user! : user)))
      setSelectedUser({
        ...data.user,
        canManageUsers: data.user.canManageUsers,
        canManageSales: data.user.canManageSales,
        canManageProducts: data.user.canManageProducts,
        canManageCategories: data.user.canManageCategories,
        canManageTheme: data.user.canManageTheme,
        canManageSettings: data.user.canManageSettings,
        isActive: data.user.isActive,
      })
    }

    setSaving(false)
    setStatus("Permissions updated successfully.")
  }

  const saveNewUser = async () => {
    setCreating(true)
    setStatus("")

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createDraft),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string; user?: AdminUserSummary }

    if (!response.ok) {
      setStatus(data.error ?? "Could not create user.")
      setCreating(false)
      return
    }

    if (data.user) {
      setUsers((current) => [data.user!, ...current.filter((user) => user.id !== data.user?.id)])
    }

    setCreating(false)
    setCreateOpen(false)
    setCreateDraft(emptyUserDraft())
    setStatus("User created successfully.")
  }

  const stats = useMemo(
    () => ({
      configured: users.filter((user) => user.role !== "viewer" || user.canManageUsers || user.canManageSales || user.canManageProducts || user.canManageCategories || user.canManageTheme || user.canManageSettings).length,
      owners: users.filter((user) => user.role === "owner").length,
      active: users.filter((user) => user.isActive).length,
    }),
    [users]
  )

  return (
    <AdminShell
      current="users"
      title="Users & Permissions"
      description="Manage admin accounts and decide what each user can access."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:px-8 lg:py-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Access control</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Manage who can do what in the admin area</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Assign roles, toggle permissions, and keep control over users who can sell, edit products, change theme content, or manage other admins.
              </p>
            </div>

            <div className="grid gap-3">
              <MiniStat label="Users" value={loading ? "..." : String(users.length)} />
              <MiniStat label="Owners" value={loading ? "..." : String(stats.owners)} />
              <MiniStat label="Active" value={loading ? "..." : String(stats.active)} />
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Admin users</h2>
              <p className="mt-1 text-sm text-slate-500">Click a row to edit role and permissions.</p>
            </div>

            <div className="flex flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
              <label className="block w-full space-y-2 sm:max-w-sm">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Email, name, role..."
                    className="admin-input pl-9"
                  />
                </div>
              </label>

              <Button type="button" className="gap-2" onClick={openCreateUser} disabled={!canManageUsers}>
                <UserPlus className="h-4 w-4" />
                Create user
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => {
                    const isCurrent = user.id === currentUserId
                    return (
                      <tr key={user.id} className="text-sm text-slate-700">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-950">{user.fullName || "Unnamed user"}</p>
                              <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {user.canManageUsers ? <PermBadge label="Users" tone="emerald" /> : null}
                            {user.canManageSales ? <PermBadge label="Sales" tone="blue" /> : null}
                            {user.canManageProducts ? <PermBadge label="Products" tone="amber" /> : null}
                            {user.canManageTheme ? <PermBadge label="Theme" tone="violet" /> : null}
                            {user.canManageSettings ? <PermBadge label="Settings" tone="slate" /> : null}
                            {user.canManageCategories ? <PermBadge label="Categories" tone="cyan" /> : null}
                            {!user.canManageUsers && !user.canManageSales && !user.canManageProducts && !user.canManageTheme && !user.canManageSettings && !user.canManageCategories ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">No access</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              <ShieldOff className="h-3.5 w-3.5" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditor(user)} className="gap-2">
                            <UserRoundCog className="h-4 w-4" />
                            Manage
                          </Button>
                          {isCurrent ? <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">You</p> : null}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {!canManageUsers ? (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-amber-900">
            You can view the user directory, but your current permissions do not allow changes.
          </section>
        ) : null}

        {status ? (
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            {status}
          </section>
        ) : null}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <SheetTitle className="flex items-center gap-2 text-slate-950">
              <Shield className="h-5 w-5" />
              Edit user permissions
            </SheetTitle>
            <SheetDescription>Change the role and the capabilities assigned to this admin user.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selectedUser ? (
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{selectedUser.fullName || "Unnamed user"}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
                  <p className="mt-2 text-xs text-slate-400">User ID: {selectedUser.id}</p>
                </section>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Role</span>
                  <select
                    value={selectedUser.role}
                    onChange={(event) => {
                      const nextRole = event.target.value as AdminUserRole
                      setSelectedUser((current) => (current ? { ...current, role: nextRole } : current))
                    }}
                    className="admin-input"
                  >
                    {Object.entries(ADMIN_ROLE_LABELS).map(([role, label]) => (
                      <option key={role} value={role}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => applyRoleDefaults(selectedUser.role as AdminUserRole)}>
                    Apply role defaults
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedUser((current) =>
                        current
                          ? {
                              ...current,
                              isActive: !current.isActive,
                            }
                          : current
                      )
                    }
                  >
                    {selectedUser.isActive ? "Deactivate user" : "Activate user"}
                  </Button>
                </div>

                <section className="grid gap-3 sm:grid-cols-2">
                  <PermissionToggle
                    label="Manage users"
                    checked={selectedUser.canManageUsers}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageUsers: checked } : current))}
                  />
                  <PermissionToggle
                    label="Manage sales"
                    checked={selectedUser.canManageSales}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageSales: checked } : current))}
                  />
                  <PermissionToggle
                    label="Manage products"
                    checked={selectedUser.canManageProducts}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageProducts: checked } : current))}
                  />
                  <PermissionToggle
                    label="Manage categories"
                    checked={selectedUser.canManageCategories}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageCategories: checked } : current))}
                  />
                  <PermissionToggle
                    label="Manage theme"
                    checked={selectedUser.canManageTheme}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageTheme: checked } : current))}
                  />
                  <PermissionToggle
                    label="Manage settings"
                    checked={selectedUser.canManageSettings}
                    onChange={(checked) => setSelectedUser((current) => (current ? { ...current, canManageSettings: checked } : current))}
                  />
                </section>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
                Select a user from the table to edit permissions.
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
                Close
              </Button>
              <Button type="button" className="flex-1" onClick={() => void saveUser()} disabled={saving || !selectedUser || !canManageUsers}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setCreateDraft(emptyUserDraft())
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <SheetTitle className="flex items-center gap-2 text-slate-950">
              <Plus className="h-5 w-5" />
              Create user
            </SheetTitle>
            <SheetDescription>Invite a new admin account and assign permissions right away.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Email</span>
                  <input
                    value={createDraft.email}
                    onChange={(event) => setCreateDraft((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    className="admin-input"
                    placeholder="user@example.com"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Password</span>
                  <input
                    value={createDraft.password}
                    onChange={(event) => setCreateDraft((current) => ({ ...current, password: event.target.value }))}
                    type="password"
                    className="admin-input"
                    placeholder="Create a login password"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Full name</span>
                  <input
                    value={createDraft.fullName}
                    onChange={(event) => setCreateDraft((current) => ({ ...current, fullName: event.target.value }))}
                    type="text"
                    className="admin-input"
                    placeholder="Amina El Fassi"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Role</span>
                <select
                  value={createDraft.role}
                  onChange={(event) => {
                    const nextRole = event.target.value as AdminUserRole
                    const defaults = getRoleDefaults(nextRole)
                    setCreateDraft((current) => ({
                      ...current,
                      role: nextRole,
                      ...defaults,
                    }))
                  }}
                  className="admin-input"
                >
                  {Object.entries(ADMIN_ROLE_LABELS).map(([role, label]) => (
                    <option key={role} value={role}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <section className="grid gap-3 sm:grid-cols-2">
                <PermissionToggle
                  label="Manage users"
                  checked={createDraft.canManageUsers}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageUsers: checked }))}
                />
                <PermissionToggle
                  label="Manage sales"
                  checked={createDraft.canManageSales}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageSales: checked }))}
                />
                <PermissionToggle
                  label="Manage products"
                  checked={createDraft.canManageProducts}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageProducts: checked }))}
                />
                <PermissionToggle
                  label="Manage categories"
                  checked={createDraft.canManageCategories}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageCategories: checked }))}
                />
                <PermissionToggle
                  label="Manage theme"
                  checked={createDraft.canManageTheme}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageTheme: checked }))}
                />
                <PermissionToggle
                  label="Manage settings"
                  checked={createDraft.canManageSettings}
                  onChange={(checked) => setCreateDraft((current) => ({ ...current, canManageSettings: checked }))}
                />
              </section>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 gap-2"
                onClick={() => void saveNewUser()}
                disabled={creating || !createDraft.email.trim() || !createDraft.password.trim() || !canManageUsers}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create user"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AdminShell>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const label = ADMIN_ROLE_LABELS[role as AdminUserRole] ?? role
  const tone =
    role === "owner"
      ? "bg-slate-950 text-white"
      : role === "admin"
        ? "bg-emerald-100 text-emerald-900"
        : role === "manager"
          ? "bg-blue-100 text-blue-900"
          : role === "cashier"
            ? "bg-amber-100 text-amber-900"
            : "bg-slate-100 text-slate-600"

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
}

function PermBadge({ label, tone }: { label: string; tone: "emerald" | "blue" | "amber" | "violet" | "slate" | "cyan" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
    cyan: "bg-cyan-50 text-cyan-700",
  }

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{label}</span>
}

function PermissionToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
      />
    </label>
  )
}
