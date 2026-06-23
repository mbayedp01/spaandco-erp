import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type StaffMember = Database['public']['Tables']['staff']['Row']

export async function getStaff(spaId?: string): Promise<StaffMember[]> {
  const supabase = createServerClient()
  let query = supabase.from('staff').select('*').order('first_name')
  if (spaId) query = query.eq('spa_id', spaId)
  const { data, error } = await query
  if (error) console.error('getStaff:', error.message)
  return (data as StaffMember[] | null) ?? []
}
