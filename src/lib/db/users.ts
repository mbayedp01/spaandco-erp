import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUserRole } from '@/lib/user-role'
import type { Database } from '@/lib/supabase/types'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// La lecture de user_profiles via la session échoue (la politique RLS
// référence auth.users) : on passe par le client admin, réservé aux admins.
export async function getAppUsers(): Promise<UserProfile[]> {
  if ((await getCurrentUserRole()) !== 'admin') return []
  let supabase
  try { supabase = createAdminClient() } catch (e) {
    console.error('getAppUsers:', (e as Error).message)
    return []
  }
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('getAppUsers:', error.message)
    return []
  }
  return (data as UserProfile[] | null) ?? []
}

export async function updateUserProfile(
  id: string,
  updates: { role?: string; name?: string; status?: string },
): Promise<{ error?: string }> {
  if ((await getCurrentUserRole()) !== 'admin') return { error: 'Permission refusée' }
  const supabase = createAdminClient()
  const { error } = await (supabase.from('user_profiles') as any)
    .update(updates)
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}
