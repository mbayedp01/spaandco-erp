import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Supplier = Database['public']['Tables']['suppliers']['Row']

export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')
  if (error) console.error('getSuppliers:', error.message)
  return (data as Supplier[] | null) ?? []
}
