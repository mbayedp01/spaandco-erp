import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Client = Database['public']['Tables']['clients']['Row']

export async function getClients(spaId?: string | null): Promise<Client[]> {
  const supabase = createServerClient()
  let q = supabase.from('clients').select('*').order('total_spent', { ascending: false })
  if (spaId) q = (q as any).eq('spa_id', spaId)
  const { data, error } = await q
  if (error) {
    console.error('getClients:', error.message)
    if (spaId && error.message.includes('spa_id')) {
      const { data: fallback } = await supabase.from('clients').select('*').order('total_spent', { ascending: false })
      return (fallback as Client[] | null) ?? []
    }
  }
  return (data as Client[] | null) ?? []
}

export async function createClient(payload: {
  first_name: string
  last_name: string
  email: string
  phone: string
  birth_date?: string | null
  spa_id?: string | null
}): Promise<{ data?: Client; error?: string }> {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...payload,
      join_date: today,
      loyalty_points: 0,
      is_vip: false,
      total_spent: 0,
      visits_count: 0,
    } as any)
    .select()
    .single()
  if (error) return { error: error.message }
  return { data: data as Client }
}
