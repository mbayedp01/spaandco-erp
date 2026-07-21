import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export async function getAppUsers(): Promise<UserProfile[]> {
  const supabase = createServerClient()
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
  const supabase = createServerClient()
  const { error } = await (supabase.from('user_profiles') as any)
    .update(updates)
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}
