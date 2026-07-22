import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createServerClient() {
  const cookieStore = cookies()
  // In dev bypass mode, use service role to bypass RLS (no real auth session exists)
  const isDev = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  const supabaseKey = isDev
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
