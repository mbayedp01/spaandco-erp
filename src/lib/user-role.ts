import { createServerClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'

export async function getCurrentUserRole(): Promise<UserRole> {
  const IS_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (IS_DEV_BYPASS) return 'admin'

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Visiteur non connecté : jamais administrateur, le rôle le moins privilégié.
  if (!user) return 'stock'
  const role = user.user_metadata?.role as UserRole | undefined
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

// Same identity the cash action stores in cash_transactions.created_by.
export async function getCurrentUserIdentity(): Promise<{ label: string; email: string | null } | null> {
  const IS_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (IS_DEV_BYPASS) return null

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const label = (user?.user_metadata?.name as string | undefined) ?? user?.email
  return label ? { label, email: user?.email ?? null } : null
}
