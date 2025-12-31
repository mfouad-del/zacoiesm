// import { createServerClient } from "@supabase/ssr"

export async function createClient() {
  // In Vite/SPA, we don't have access to next/headers cookies().
  // This function is likely not used in the client-side app, or should be replaced by client.ts
  throw new Error("createServerClient is not supported in Vite client-side environment. Use createClient from ./client.ts instead.");
}

