import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Use let to avoid TDZ issues with circular dependencies
let client: SupabaseClient | undefined

export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )

  return client
}
