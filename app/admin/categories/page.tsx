"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { Check, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { slugify } from "@/lib/blog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CategoryForm = {
  name: string
  slug: string
  description: string
  active: boolean
  sortOrder: string
}

type CategoryRow = {
  id: number
  name: string
  slug: string
  description: string | null
  active: boolean
  sort_order: number
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  active: true,
  sortOrder: "0",
}

export default function CategoriesPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    setStatus("")
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) {
        setRows([])
        setStatus(`Impossible de charger les catégories depuis Supabase : ${error.message}`)
      } else {
        setRows((data ?? []) as CategoryRow[])
      }
    } catch (error) {
      setRows([])
      setStatus(error instanceof Error ? error.message : "Impossible de charger les catégories depuis Supabase.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const openAddSheet = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSlugTouched(false)
    setStatus("")
    setSheetOpen(true)
  }

  const openEditSheet = (row: CategoryRow) => {
    setEditingId(row.id)
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      active: row.active,
      sortOrder: String(row.sort_order),
    })
    setSlugTouched(Boolean(row.slug))
    setStatus("")
    setSheetOpen(true)
  }

  const handleChange = (field: keyof CategoryForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === "active" ? String((event.target as HTMLInputElement).checked) : event.target.value

    if (field === "slug") {
      setSlugTouched(value.trim().length > 0)
    }

    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !slugTouched ? { slug: slugify(value) } : {}),
    }))
  }

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault()

    const slug = slugify(form.slug) || slugify(form.name)
    if (!slug) {
      setStatus("Le slug est requis : saisissez un nom ou un slug valide.")
      return
    }

    setSaving(true)
    setStatus("")
    try {
      const payload = {
        name: form.name,
        slug,
        description: form.description || null,
        active: form.active,
        sort_order: Number(form.sortOrder),
      }

      const query = editingId === null
        ? supabase.from("product_categories").insert(payload)
        : supabase.from("product_categories").update(payload).eq("id", editingId)

      const { error } = await query

      if (error) {
        setStatus(`Impossible d'enregistrer la catégorie : ${error.message}`)
      } else {
        setStatus(editingId === null ? "Catégorie ajoutée." : "Catégorie mise à jour.")
        setSheetOpen(false)
        setEditingId(null)
        setForm(emptyForm)
        setSlugTouched(false)
        await loadCategories()
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Impossible d'enregistrer la catégorie.")
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: number) => {
    setSaving(true)
    setStatus("")
    try {
      const { error } = await supabase.from("product_categories").delete().eq("id", id)

      if (error) {
        setStatus(`Impossible de supprimer la catégorie : ${error.message}`)
      } else {
        setStatus("Catégorie supprimée.")
        await loadCategories()
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Impossible de supprimer la catégorie.")
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return

    const targetId = deleteTarget.id
    setDeleteTarget(null)
    await deleteCategory(targetId)
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1877F2]">Structure du catalogue</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Catégories</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep the product taxonomy tidy so the product form stays fast and the storefront stays understandable.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                  {loading ? "..." : `${rows.filter((row) => row.active).length} active`}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Ordre respecté
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddSheet}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Ajouter une catégorie
            </button>
          </div>

          {status ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {status}
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="space-y-4 lg:hidden">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Chargement des catégories...
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Aucune catégorie pour le moment. Ajoutez la première catégorie pour définir le catalogue.
              </div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{row.name}</div>
                      <div className="mt-1 text-xs text-slate-500">#{row.id} · {row.slug}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"}`}>
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-500">
                    {row.description ?? "—"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Ordre
                      <div className="mt-1 text-sm font-semibold text-slate-900">{row.sort_order}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Statut
                      <div className="mt-1 text-sm font-semibold text-slate-900">{row.active ? "Visible" : "Masquée"}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSheet(row)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    Chargement des catégories...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                    Aucune catégorie pour le moment. Ajoutez votre première catégorie pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-slate-900">#{row.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{row.name}</TableCell>
                    <TableCell className="text-slate-500">{row.slug}</TableCell>
                    <TableCell className="text-slate-500">{row.sort_order}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"}`}>
                        {row.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-slate-500">{row.description ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditSheet(row)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <SheetTitle className="text-3xl font-semibold text-slate-900">
              {editingId === null ? "Ajouter une catégorie" : "Modifier une catégorie"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Créez une catégorie et elle sera disponible dans la création de produit.
            </SheetDescription>
          </SheetHeader>

          <form className="grid gap-4 px-6 py-5" onSubmit={saveCategory}>
            <Field label="Name">
              <input value={form.name} onChange={handleChange("name")} className="admin-input" />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={handleChange("slug")}
                className="admin-input"
                placeholder="olive-oils"
              />
            </Field>
            <Field label="Description">
              <input value={form.description} onChange={handleChange("description")} className="admin-input" />
            </Field>
            <Field label="Sort order">
              <input value={form.sortOrder} onChange={handleChange("sortOrder")} className="admin-input" type="number" />
            </Field>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4"
              />
              Active
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1669d4] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Enregistrement..." : editingId === null ? "Créer la catégorie" : "Mettre à jour la catégorie"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSheetOpen(false)
                  setEditingId(null)
                  setForm(emptyForm)
                  setSlugTouched(false)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.name ? <span className="font-medium text-slate-900">{deleteTarget.name}</span> : "this category"} from Supabase.
              Products that use this category may need to be updated first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void confirmDeleteCategory()
              }}
              disabled={saving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {saving ? "Suppression..." : "Supprimer la catégorie"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      {children}
    </label>
  )
}
