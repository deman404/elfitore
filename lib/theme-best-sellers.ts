export type ThemeBestSellersData = {
  productIds: number[]
}

export const DEFAULT_THEME_BEST_SELLERS: ThemeBestSellersData = {
  productIds: [],
}

export function fetchThemeBestSellers() {
  return fetch("/api/theme-best-sellers", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_BEST_SELLERS
    return (await response.json()) as ThemeBestSellersData
  })
}
