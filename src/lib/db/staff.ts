import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type StaffMember = Database['public']['Tables']['staff']['Row']

export async function getStaff(): Promise<StaffMember[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('first_name')
  if (error) console.error('getStaff:', error.message)
  return (data as StaffMember[] | null) ?? []
}
