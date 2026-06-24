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
