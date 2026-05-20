"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  BadgeDollarSign,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  Palette,
  Settings,
  Store,
  UserCircle,
  X,
} from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { canAccessAdminSection, type AdminAccessSnapshot, type AdminSection } from "@/lib/admin-access"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { ADMIN_ROLE_LABELS } from "@/lib/admin-users"

type NavGroup = {
  label: string
  icon: typeof LayoutDashboard
  items: Array<{
    href: string
    label: string
    section: AdminSection
  }>
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    icon: Store,
    items: [{ href: "/admin", label: "Tableau de bord", section: "dashboard" }],
  },
  {
    label: "Ventes",
    icon: BadgeDollarSign,
    items: [
      { href: "/admin/sell-point", label: "Point de vente", section: "sell-point" },
      { href: "/admin/sell-point/last-receipt", label: "Dernières ventes", section: "last-sell" },
      { href: "/admin/orders", label: "Commandes web", section: "orders" },
    ],
  },
  {
    label: "Catalogue",
    icon: Package,
    items: [
      { href: "/admin/addProduct", label: "Produits", section: "products" },
      { href: "/admin/categories", label: "Catégories", section: "categories" },
    ],
  },
  {
    label: "Apparence",
    icon: Palette,
    items: [
      { href: "/admin/blogs", label: "Blog", section: "blog" },
      { href: "/admin/pages", label: "Pages", section: "pages" },
      { href: "/admin/theme", label: "Thème", section: "theme" },
    ],
  },
  {
    label: "Administration",
    icon: Settings,
    items: [
      { href: "/admin/users", label: "Utilisateurs", section: "users" },
      { href: "/admin/settings", label: "Paramètres", section: "settings" },
    ],
  },
]

const sectionMeta: Record<
  AdminSection,
  { title: string; description: string }
> = {
  dashboard: { title: "Tableau de bord", description: "Vue d'ensemble de votre boutique en temps réel." },
  blog: { title: "Blog", description: "Publiez et gérez les articles du site." },
  pages: { title: "Pages", description: "Créez des pages personnalisées avec image et contenu." },
  "sell-point": { title: "Point de vente", description: "Encaissement rapide en magasin." },
  "last-sell": { title: "Dernières ventes", description: "Historique des transactions et reçus." },
  orders: { title: "Commandes web", description: "Gérez les commandes en ligne et leur statut." },
  products: { title: "Produits", description: "Ajoutez, modifiez et organisez votre catalogue." },
  categories: { title: "Catégories", description: "Structurez votre catalogue par catégories." },
  theme: { title: "Thème", description: "Personnalisez l'apparence de votre boutique." },
  users: { title: "Utilisateurs", description: "Gérez les rôles et permissions de l'équipe." },
  settings: { title: "Paramètres", description: "Configurez les options de votre boutique." },
  auth: { title: "Connexion", description: "" },
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [access, setAccess] = useState<AdminAccessSnapshot | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)

  const currentSection: AdminSection = useMemo(() => {
    if (pathname === "/admin") return "dashboard"
    if (pathname.startsWith("/admin/sell-point/last-receipt")) return "last-sell"
    if (pathname.startsWith("/admin/sell-point")) return "sell-point"
    if (pathname.startsWith("/admin/orders")) return "orders"
    if (pathname.startsWith("/admin/addProduct")) return "products"
    if (pathname.startsWith("/admin/categories")) return "categories"
    if (pathname.startsWith("/admin/blogs")) return "blog"
    if (pathname.startsWith("/admin/pages")) return "pages"
    if (pathname.startsWith("/admin/theme")) return "theme"
    if (pathname.startsWith("/admin/users")) return "users"
    if (pathname.startsWith("/admin/settings")) return "settings"
    if (pathname.startsWith("/admin/auth")) return "auth"
    return "dashboard"
  }, [pathname])

  const meta = sectionMeta[currentSection]
  const roleLabel = access?.user?.role && access.user.role in ADMIN_ROLE_LABELS
    ? ADMIN_ROLE_LABELS[access.user.role as keyof typeof ADMIN_ROLE_LABELS]
    : "Utilisateur"

  // Load sidebar state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-sidebar-collapsed")
      if (saved) setCollapsed(saved === "true")
      const savedGroups = localStorage.getItem("admin-expanded-groups")
      if (savedGroups) setExpandedGroups(new Set(JSON.parse(savedGroups)))
    } catch {
      // ignore
    }
  }, [])

  // Save sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("admin-sidebar-collapsed", String(collapsed))
      localStorage.setItem("admin-expanded-groups", JSON.stringify([...expandedGroups]))
    } catch {
      // ignore
    }
  }, [collapsed, expandedGroups])

  // Auto-expand group containing current section
  useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some((item) => item.section === currentSection)) {
        setExpandedGroups((prev) => new Set([...prev, group.label]))
        break
      }
    }
  }, [currentSection])

  // Load access
  useEffect(() => {
    let active = true
    const load = async () => {
      setAccessLoading(true)
      const res = await fetch("/api/admin/me")
      const data = (await res.json().catch(() => ({}))) as AdminAccessSnapshot & { error?: string }
      if (!active) return
      setAccess(res.ok ? data : null)
      setAccessLoading(false)
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/auth")
    router.refresh()
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const visibleGroups = useMemo(() => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canAccessAdminSection(access, item.section)),
      }))
      .filter((group) => group.items.length > 0)
  }, [access])

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f7]">
        <div className="flex items-center gap-3 rounded-lg border bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          Chargement de l'administration...
        </div>
      </div>
    )
  }

  const canViewCurrent = canAccessAdminSection(access, currentSection)

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] border-r border-slate-200 bg-white p-0">
          <Sidebar
            groups={visibleGroups}
            currentSection={currentSection}
            access={access}
            roleLabel={roleLabel}
            collapsed={false}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            onNavigate={() => setMobileOpen(false)}
            isMobile
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:flex lg:flex-col ${
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        }`}
      >
        <Sidebar
          groups={visibleGroups}
          currentSection={currentSection}
          access={access}
          roleLabel={roleLabel}
          collapsed={collapsed}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
        />
      </aside>

      {/* Main content area */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-slate-500 lg:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
          </Button>

          {/* Breadcrumb */}
          <nav className="hidden items-center gap-1 text-sm text-slate-500 md:flex">
            <span className="font-medium text-slate-400">Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-900">{meta.title}</span>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir le site
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-2 text-slate-600 hover:text-slate-900">
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden max-w-[120px] truncate text-xs font-medium sm:inline">
                    {access?.user?.fullName || access?.user?.email || "Admin"}
                  </span>
                  <ChevronDown className="hidden h-3 w-3 sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">
                    {access?.user?.fullName || access?.user?.email || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {roleLabel}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank" className="cursor-pointer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir le site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page header */}
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{meta.title}</h1>
          {meta.description ? (
            <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
          ) : null}
        </div>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {canViewCurrent ? (
            children
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h2 className="text-lg font-semibold">Accès refusé</h2>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Votre rôle actuel ne permet pas d'accéder à cette section. Contactez un administrateur pour modifier vos permissions.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/admin"
                      className="inline-flex items-center rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                    >
                      Tableau de bord
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="inline-flex items-center rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Sidebar({
  groups,
  currentSection,
  access,
  roleLabel,
  collapsed,
  expandedGroups,
  toggleGroup,
  onNavigate,
  isMobile,
}: {
  groups: NavGroup[]
  currentSection: AdminSection
  access: AdminAccessSnapshot | null
  roleLabel: string
  collapsed: boolean
  expandedGroups: Set<string>
  toggleGroup: (label: string) => void
  onNavigate?: () => void
  isMobile?: boolean
}) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/auth")
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-4">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
          <Image src="/logo.png" alt="El Fitore" fill sizes="32px" className="object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">El Fitore</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Administration</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onNavigate}
            className="ml-auto text-slate-400 hover:text-slate-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            {collapsed && !isMobile ? (
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.section === currentSection
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[#2271b1]/10 text-[#2271b1]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <GroupIcon label={group.label} active={active} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-600"
                >
                  <GroupIcon label={group.label} active={false} />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      expandedGroups.has(group.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedGroups.has(group.label) && (
                  <div className="mt-1 space-y-0.5 pl-7">
                    {group.items.map((item) => {
                      const active = item.section === currentSection
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition ${
                            active
                              ? "bg-[#2271b1]/10 text-[#2271b1]"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {active && <span className="absolute -left-0.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#2271b1]" />}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* User / Logout */}
      <div className="border-t border-slate-200 p-3">
        {collapsed && !isMobile ? (
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-center rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {access?.user?.fullName || access?.user?.email || "Admin"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {roleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function GroupIcon({ label, active }: { label: string; active: boolean }) {
  const className = `h-4 w-4 shrink-0 ${active ? "text-[#2271b1]" : "text-slate-400"}`
  switch (label) {
    case "Principal":
      return <LayoutDashboard className={className} />
    case "Ventes":
      return <BadgeDollarSign className={className} />
    case "Catalogue":
      return <Package className={className} />
    case "Apparence":
      return <Palette className={className} />
    case "Administration":
      return <Settings className={className} />
    default:
      return <ChevronRight className={className} />
  }
}
