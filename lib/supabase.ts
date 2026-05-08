import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

declare global {
  // Reuse one browser client across hot reloads and route transitions.
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}

function createUnavailableSupabaseClient() {
  const error = new Error(
    "Supabase browser client is unavailable during prerender or because NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing."
  )

  return new Proxy(
    {},
    {
      get() {
        return () => {
          throw error
        }
      },
    }
  ) as SupabaseClient
}

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return createUnavailableSupabaseClient()
  }

  if (!globalThis.__supabaseClient) {
    const config = getSupabaseConfig()

    if (!config) {
      return createUnavailableSupabaseClient()
    }

    const { supabaseUrl, supabaseAnonKey } = config
    globalThis.__supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return globalThis.__supabaseClient
}
