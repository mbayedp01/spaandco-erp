import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Service = Database['public']['Tables']['services']['Row']

export async function getServices(): Promise<Service[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('category')
    .order('name')
  if (error) console.error('getServices:', error.message)
  return (data as Service[] | null) ?? []
}
