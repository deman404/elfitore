"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { CatalogCategoryRow } from "@/lib/catalog"

type CategoryContextValue = {
  categories: CatalogCategoryRow[]
  loading: boolean
  getCategoryById: (id: number | null | undefined) => CatalogCategoryRow | undefined
  getCategoryBySlug: (slug: string | null | undefined) => CatalogCategoryRow | undefined
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from("product_categories")
          .select("id, name, slug, active, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true })

        setCategories((data ?? []) as CatalogCategoryRow[])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [supabase])

  const getCategoryById = (id: number | null | undefined) => {
    if (id === null || id === undefined) return undefined
    return categories.find((category) => category.id === id)
  }

  const getCategoryBySlug = (slug: string | null | undefined) => {
    if (!slug) return undefined
    return categories.find((category) => category.slug === slug)
  }

  const value = useMemo(
    () => ({ categories, loading, getCategoryById, getCategoryBySlug }),
    [categories, loading]
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider")
  }
  return context
}