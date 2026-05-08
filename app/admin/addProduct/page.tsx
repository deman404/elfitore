"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { Check, Loader2, Plus, Pencil, Trash2, Upload, X } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { getSupabaseBrowserClient } from "@/lib/supabase"
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

type ProductSizeForm = {
  id: string
  label: string
  price: string
}

type ProductForm = {
  nameEn: string
  nameFr: string
  nameAr: string
  descriptionEn: string
  descriptionFr: string
  descriptionAr: string
  price: string
  category: string
  sizes: ProductSizeForm[]
}

type ProductRow = {
  id: number
  name_en: string
  name_fr: string
  name_ar: string
  description_en: string
  description_fr: string
  description_ar: string
  price: number
  image: string
  images: string[]
  category: string
  sizes: unknown
}

function createSizeRow(): ProductSizeForm {
  return { id: crypto.randomUUID(), label: "", price: "" }
}

function normalizeSizes(value: unknown, fallbackPrice?: number): ProductSizeForm[] {
  const toSizes = (candidate: unknown) => {
    if (!Array.isArray(candidate)) return []

    return candidate
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const label = "label" in item ? String((item as { label?: unknown }).label ?? "").trim() : ""
        const price = "price" in item ? String((item as { price?: unknown }).price ?? "").trim() : ""
        if (!label && !price) return null
        return { id: crypto.randomUUID(), label, price }
      })
      .filter((item): item is ProductSizeForm => Boolean(item))
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      const parsedSizes = toSizes(parsed)
      if (parsedSizes.length) return parsedSizes
    } catch {
      // ignore invalid JSON and fall through to the fallback
    }
  }

  const directSizes = toSizes(value)
  if (directSizes.length) return directSizes

  if (typeof fallbackPrice === "number" && Number.isFinite(fallbackPrice)) {
    return [{ id: crypto.randomUUID(), label: "Standard", price: String(fallbackPrice) }]
  }

  return [createSizeRow()]
}

const emptyForm: ProductForm = {
  nameEn: "",
  nameFr: "",
  nameAr: "",
  descriptionEn: "",
  descriptionFr: "",
  descriptionAr: "",
  price: "",
  category: "",
  sizes: [createSizeRow()],
}

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const STORAGE_BUCKET = "product-images"

export default function AddProductPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<Array<{ key: string; url: string; file: File }>>([])
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([])

  const loadProducts = async () => {
    setLoading(true)
    setStatus("")

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      setStatus(`Could not load products from Supabase: ${error.message}`)
      setRows([])
    } else {
      setRows(((data ?? []) as unknown) as ProductRow[])
    }

    setLoading(false)
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from("product_categories")
      .select("id, name, slug")
      .eq("active", true)
      .order("sort_order", { ascending: true })

    setCategories(((data ?? []) as unknown) as Array<{ id: number; name: string; slug: string }>)
  }

  useEffect(() => {
    void loadProducts()
    void loadCategories()
  }, [])

  useEffect(() => {
    return () => {
      newImages.forEach((image) => URL.revokeObjectURL(image.url))
    }
  }, [newImages])

  const openAddSheet = () => {
    setEditingRowId(null)
    setForm(emptyForm)
    setExistingImages([])
    newImages.forEach((image) => URL.revokeObjectURL(image.url))
    setNewImages([])
    setStatus("")
    setSheetOpen(true)
  }

  const openEditSheet = (row: ProductRow) => {
    setEditingRowId(row.id)
    setForm({
      nameEn: row.name_en,
      nameFr: row.name_fr,
      nameAr: row.name_ar,
      descriptionEn: row.description_en,
      descriptionFr: row.description_fr,
      descriptionAr: row.description_ar,
      price: String(row.price),
      category: row.category,
      sizes: normalizeSizes(row.sizes, row.price),
    })
    setExistingImages((row.images?.length ? row.images : [row.image]).filter(Boolean))
    newImages.forEach((image) => URL.revokeObjectURL(image.url))
    setNewImages([])
    setStatus("")
    setSheetOpen(true)
  }

  const resetForm = () => {
    setEditingRowId(null)
    setForm(emptyForm)
    setExistingImages([])
    newImages.forEach((image) => URL.revokeObjectURL(image.url))
    setNewImages([])
  }

  const handleChange = (field: keyof ProductForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSizeChange = (index: number, field: keyof ProductSizeForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.map((size, sizeIndex) =>
        sizeIndex === index ? { ...size, [field]: event.target.value } : size,
      ),
    }))
  }

  const addSizeRow = () => {
    setForm((current) => ({
      ...current,
      sizes: [...current.sizes, createSizeRow()],
    }))
  }

  const removeSizeRow = (index: number) => {
    setForm((current) => {
      const nextSizes = current.sizes.filter((_, sizeIndex) => sizeIndex !== index)
      return {
        ...current,
        sizes: nextSizes.length ? nextSizes : [createSizeRow()],
      }
    })
  }

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return

    const incoming = Array.from(files)
    const nextImages = [...newImages]

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setStatus("Only image files are allowed.")
        continue
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setStatus("Each image must be 2 MB or smaller.")
        continue
      }

      if (existingImages.length + nextImages.length >= MAX_IMAGES) {
        setStatus("You can upload a maximum of 5 images per product.")
        break
      }

      nextImages.push({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        url: URL.createObjectURL(file),
        file,
      })
    }

    if (nextImages.length !== newImages.length) {
      setStatus("")
      setNewImages(nextImages.slice(0, Math.max(0, MAX_IMAGES - existingImages.length)))
    }
  }

  const removeExistingImage = (url: string) => {
    setExistingImages((current) => current.filter((item) => item !== url))
  }

  const removeNewImage = (key: string) => {
    setNewImages((current) => {
      const next = current.filter((item) => item.key !== key)
      const removed = current.find((item) => item.key === key)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return next
    })
  }

  const uploadNewImages = async (files: File[]) => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const filePath = `products/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

      if (error) {
        throw new Error(error.message)
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
      uploadedUrls.push(data.publicUrl)
    }

    return uploadedUrls
  }

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setStatus("")

    const totalImages = existingImages.length + newImages.length

    if (!form.category) {
      setStatus("Please select a category.")
      setSaving(false)
      return
    }

    if (totalImages === 0) {
      setStatus("Please add at least one image.")
      setSaving(false)
      return
    }

    if (totalImages > MAX_IMAGES) {
      setStatus("You can only use up to 5 images per product.")
      setSaving(false)
      return
    }

    const normalizedSizes = form.sizes.map((size) => ({
      label: size.label.trim(),
      price: size.price.trim(),
    }))

    if (!normalizedSizes.length || normalizedSizes.every((size) => !size.label && !size.price)) {
      setStatus("Please add at least one size with its price.")
      setSaving(false)
      return
    }

    if (normalizedSizes.some((size) => !size.label || !size.price || Number.isNaN(Number(size.price)))) {
      setStatus("Each size needs a label and a valid price.")
      setSaving(false)
      return
    }

    const basePrice = form.price.trim() ? Number(form.price) : Number(normalizedSizes[0].price)

    if (Number.isNaN(basePrice) || basePrice < 0) {
      setStatus("Please enter a valid base price.")
      setSaving(false)
      return
    }

    try {
      const uploadedUrls = newImages.length ? await uploadNewImages(newImages.map((image) => image.file)) : []
      const images = [...existingImages, ...uploadedUrls].slice(0, MAX_IMAGES)
      const payload = {
        name_en: form.nameEn,
        name_fr: form.nameFr,
        name_ar: form.nameAr,
        description_en: form.descriptionEn,
        description_fr: form.descriptionFr,
        description_ar: form.descriptionAr,
        price: basePrice,
        image: images[0],
        images,
        category: form.category,
        sizes: normalizedSizes.map((size) => ({
          label: size.label,
          price: Number(size.price),
        })),
      }

      if (editingRowId !== null) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingRowId)

        if (error) {
          setStatus(`Could not save to Supabase: ${error.message}`)
          return
        }

      setStatus("Product updated.")
      } else {
        const { error } = await supabase.from("products").insert(payload)

        if (error) {
          setStatus(`Could not save to Supabase: ${error.message}`)
          return
        }

      setStatus("Product added.")
      }

      setSheetOpen(false)
      resetForm()
      await loadProducts()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not upload images.")
    } finally {
      setSaving(false)
    }
  }

  const deleteRow = async (id: number) => {
    setSaving(true)
    setStatus("")
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      setStatus(`Could not delete from Supabase: ${error.message}`)
    } else {
      setStatus("Product deleted.")
      await loadProducts()
    }

    setSaving(false)
  }

  const previewImages = [
    ...existingImages.map((url) => ({
      key: url,
      url,
      isRemote: true,
    })),
    ...newImages.map((image) => ({
      key: image.key,
      url: image.url,
      isRemote: false,
      file: image.file,
    })),
  ]

  return (
    <AdminShell
      current="products"
      title="Product Manager"
      description="Add, edit, and remove products using Supabase as the backing store."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Products table</h2>
             
            </div>

            <button
              type="button"
              onClick={openAddSheet}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1669d4]"
            >
              <Plus className="h-4 w-4" />
              Add product
            </button>
          </div>

          {status ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {status}
            </p>
          ) : null}
        </section>

        <section className="bg-white p-5 shadow-sm ring-1 ring-black/5">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                    No products yet. Add your first product to begin.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const rowImages = row.images?.length ? row.images : [row.image]
                  const rowSizes = normalizeSizes(row.sizes, row.price)
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-slate-900">#{row.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rowImages.slice(0, 5).map((image) => (
                            <div key={image} className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                              <img src={image} alt={row.name_en} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {rowImages.length > 5 ? (
                            <span className="text-xs text-slate-500">+{rowImages.length - 5}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{row.name_en}</p>
                          <p className="text-xs text-slate-500">{row.name_fr}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-xs font-semibold text-[#1877F2]">
                          {row.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {rowSizes.slice(0, 3).map((size) => (
                            <span
                              key={`${size.label}-${size.price}`}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                            >
                              {size.label} · DH {size.price}
                            </span>
                          ))}
                          {rowSizes.length === 0 ? <span className="text-sm text-slate-400">No sizes</span> : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">DH {row.price}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-slate-500">{row.description_en}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditSheet(row)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </section>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
            <SheetTitle className="text-3xl font-semibold text-slate-900">
              {editingRowId !== null ? "Edit product" : "Add product"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Fill the product details and save them to Supabase.
            </SheetDescription>
          </SheetHeader>

          <form className="grid gap-4 px-6 py-5 sm:grid-cols-2" onSubmit={saveProduct}>
            

            <Field label="Name (EN)">
              <input value={form.nameEn} onChange={handleChange("nameEn")} className="admin-input" />
            </Field>
            <Field label="Name (FR)">
              <input value={form.nameFr} onChange={handleChange("nameFr")} className="admin-input" />
            </Field>
            <Field label="Name (AR)">
              <input value={form.nameAr} onChange={handleChange("nameAr")} className="admin-input" />
            </Field>
            <Field label="Base price">
              <input
                value={form.price}
                onChange={handleChange("price")}
                className="admin-input"
                type="number"
                min="0"
                step="0.01"
              />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={handleChange("category")} className="admin-input">
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-900">Images</span>
                <span className="text-xs text-slate-500">
                  {previewImages.length}/{MAX_IMAGES} images, max 2 MB each
                </span>
              </div>

              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 transition hover:bg-slate-100">
                <Upload className="h-4 w-4" />
                Upload up to 5 images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {previewImages.map((image) => (
                  <div key={image.key} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                    <img src={image.url} alt="Product preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => (image.isRemote ? removeExistingImage(image.url) : removeNewImage(image.key))}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-900">Sizes and prices</span>
                <button
                  type="button"
                  onClick={addSizeRow}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add size
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Add at least one size and price. These values are saved with the product.
              </p>

              <div className="mt-3 space-y-3">
                {form.sizes.map((size, index) => (
                  <div
                    key={size.id}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_160px_auto] sm:items-end"
                  >
                    <Field label={`Size ${index + 1}`}>
                      <input
                        value={size.label}
                        onChange={handleSizeChange(index, "label")}
                        className="admin-input"
                        placeholder="30ml"
                      />
                    </Field>
                    <Field label="Price">
                      <input
                        value={size.price}
                        onChange={handleSizeChange(index, "price")}
                        className="admin-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="45"
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeSizeRow(index)}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Description (EN)" className="sm:col-span-2">
              <input value={form.descriptionEn} onChange={handleChange("descriptionEn")} className="admin-input" />
            </Field>
            <Field label="Description (FR)">
              <input value={form.descriptionFr} onChange={handleChange("descriptionFr")} className="admin-input" />
            </Field>
            <Field label="Description (AR)">
              <input value={form.descriptionAr} onChange={handleChange("descriptionAr")} className="admin-input" />
            </Field>

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1669d4] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Saving..." : editingRowId !== null ? "Update product" : "Create product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setSheetOpen(false)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </AdminShell>
  )
}

function Field({
  children,
  className = "",
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      {children}
    </label>
  )
}
