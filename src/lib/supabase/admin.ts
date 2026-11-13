import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Client « service role » : contourne la RLS. À n'utiliser que côté serveur,
// après avoir vérifié que l'utilisateur courant est administrateur.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
