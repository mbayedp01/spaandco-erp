import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Service = Database['public']['Tables']['services']['Row']

export async function getServices(spaId?: string): Promise<Service[]> {
  const supabase = createServerClient()
  let query = supabase.from('services').select('*').order('category').order('name')
  if (spaId) query = (query as any).or(`spa_id.eq.${spaId},spa_id.is.null`)
  const { data, error } = await query
  if (error) console.error('getServices:', error.message)
  return (data as Service[] | null) ?? []
}
