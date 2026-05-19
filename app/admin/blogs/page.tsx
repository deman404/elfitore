"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Check, Loader2, Plus, Pencil, Trash2, Video } from "lucide-react"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { ThemeMediaUpload } from "@/components/admin/theme-media-upload"
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBlogDate, slugify, type BlogMediaType, type BlogPost } from "@/lib/blog"

type BlogForm = {
  title: string
  slug: string
  excerpt: string
  content: string
  mediaType: BlogMediaType
  mediaUrl: string
  published: boolean
}

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  mediaType: "image",
  mediaUrl: "",
  published: true,
}

export default function AdminBlogsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<BlogForm>(emptyForm)

  const loadPosts = async () => {
    setLoading(true)
    setStatus("")

    const response = await fetch("/api/admin/blog-posts", { cache: "no-store" })
    const data = (await response.json().catch(() => ({}))) as BlogPost[] | { error?: string }

    if (!response.ok || !Array.isArray(data)) {
      setPosts([])
      setStatus((data as { error?: string }).error ?? "Impossible de charger les articles.")
    } else {
      setPosts(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadPosts()
  }, [])

  const openAddSheet = () => {
    setEditingId(null)
    setForm(emptyForm)
    setStatus("")
    setSheetOpen(true)
  }

  const openEditSheet = (post: BlogPost) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      mediaType: post.media_type,
      mediaUrl: post.media_url,
      published: post.published,
    })
    setStatus("")
    setSheetOpen(true)
  }

  const handleChange = (field: keyof BlogForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = field === "published"
      ? (event.target as HTMLInputElement).checked
      : event.target.value

    setForm((current) => {
      const next = { ...current, [field]: value } as BlogForm
      if (field === "title" && !editingId && !current.slug) {
        next.slug = slugify(String(value))
      }
      return next
    })
  }

  const savePost = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setStatus("")

    const payload = {
      id: editingId ?? undefined,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      mediaType: form.mediaType,
      mediaUrl: form.mediaUrl,
      published: form.published,
    }

    const response = await fetch("/api/admin/blog-posts", {
      method: editingId === null ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }

    if (!response.ok) {
      setStatus(data.error ?? "Impossible d’enregistrer l’article.")
    } else {
      setStatus(editingId === null ? "Article publié." : "Article mis à jour.")
      setSheetOpen(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadPosts()
    }

    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setStatus("")

    const response = await fetch("/api/admin/blog-posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    })

    const data = (await response.json().catch(() => ({}))) as { error?: string }
    if (!response.ok) {
      setStatus(data.error ?? "Impossible de supprimer l’article.")
    } else {
      setStatus("Article supprimé.")
      await loadPosts()
    }

    setDeleteTarget(null)
    setSaving(false)
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1877F2]">Contenu</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Blog</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Publiez des articles avec image ou vidéo, puis gérez-les depuis ce panneau.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddSheet}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
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
                Chargement des articles...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Aucun article pour le moment.
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {post.media_type === "video" ? (
                      <video src={post.media_url} controls className="h-full w-full object-cover" />
                    ) : (
                      <Image src={post.media_url} alt={post.title} fill className="object-cover" sizes="100vw" />
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-wider text-slate-400">{formatBlogDate(post.created_at)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${post.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {post.published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{post.title}</h3>
                    <p className="text-sm text-slate-600">{post.excerpt}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEditSheet(post)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <Pencil className="h-4 w-4" />
                        Modifier
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(post)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Publié</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                      Chargement des articles...
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                      Aucun article pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium text-slate-900">{post.title}</TableCell>
                      <TableCell className="text-slate-500">{post.slug}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${post.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {post.published ? "Publié" : "Brouillon"}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500">{formatBlogDate(post.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <button type="button" onClick={() => openEditSheet(post)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            <Pencil className="h-4 w-4" />
                            Modifier
                          </button>
                          <button type="button" onClick={() => setDeleteTarget(post)} className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
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
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editingId === null ? "Nouvel article" : "Modifier l'article"}</SheetTitle>
            <SheetDescription>Rédigez un blog avec image ou vidéo. Les changements seront visibles dès publication.</SheetDescription>
          </SheetHeader>
          <form onSubmit={savePost} className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Titre</span>
              <input value={form.title} onChange={handleChange("title")} className="admin-input" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Slug</span>
              <input value={form.slug} onChange={handleChange("slug")} className="admin-input" placeholder="my-first-post" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Extrait</span>
              <textarea value={form.excerpt} onChange={handleChange("excerpt")} className="admin-input min-h-24 resize-y" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Contenu</span>
              <textarea value={form.content} onChange={handleChange("content")} className="admin-input min-h-48 resize-y" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, mediaType: "image" }))}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  form.mediaType === "image" ? "border-[#2271b1] bg-[#2271b1]/5 text-[#2271b1]" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, mediaType: "video" }))}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  form.mediaType === "video" ? "border-[#2271b1] bg-[#2271b1]/5 text-[#2271b1]" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
            </div>

            <ThemeMediaUpload
              value={form.mediaUrl}
              onChange={(url) => setForm((current) => ({ ...current, mediaUrl: url }))}
              folder="blog"
              label={form.mediaType === "video" ? "Vidéo de couverture" : "Image de couverture"}
            />

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input type="checkbox" checked={form.published} onChange={handleChange("published")} />
              <span className="text-sm font-medium text-slate-700">Publié</span>
            </label>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button type="button" onClick={() => setSheetOpen(false)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'article de blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

