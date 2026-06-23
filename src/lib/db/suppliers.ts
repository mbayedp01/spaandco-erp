import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Supplier = Database['public']['Tables']['suppliers']['Row']

export async function getSuppliers(spaId?: string): Promise<Supplier[]> {
  const supabase = createServerClient()
  let query = supabase.from('suppliers').select('*').order('name')
  if (spaId) query = query.eq('spa_id', spaId)
  const { data, error } = await query
  if (error) console.error('getSuppliers:', error.message)
  return (data as Supplier[] | null) ?? []
}
