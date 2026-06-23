import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Establishment = Database['public']['Tables']['establishments']['Row']

export async function getEstablishments(): Promise<Establishment[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('establishments')
    .select('*')
    .order('name')
  if (error) console.error('getEstablishments:', error.message)
  return (data as Establishment[] | null) ?? []
}
