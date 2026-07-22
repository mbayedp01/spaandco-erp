import { createServerClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'

export async function getCurrentUserRole(): Promise<UserRole> {
  const IS_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (IS_DEV_BYPASS) return 'admin'

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as UserRole | undefined
  return role ?? 'admin'
}

export async function getCurrentUserName(): Promise<string | null> {
  const IS_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (IS_DEV_BYPASS) return null

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (user?.user_metadata?.name as string | undefined) ?? null
}

// Retourne le spa_id assigné au caissier (stocké dans user_metadata.spa_id)
// null = pas de restriction (admin) ou mode DEV_BYPASS
export async function getCurrentUserSpaId(): Promise<string | null> {
  const IS_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (IS_DEV_BYPASS) return null

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (user?.user_metadata?.spa_id as string | undefined) ?? null
}
