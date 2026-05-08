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

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }

  return { supabaseUrl, supabaseAnonKey }
}

export function getSupabaseBrowserClient() {
  if (!globalThis.__supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
    globalThis.__supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return globalThis.__supabaseClient
}
