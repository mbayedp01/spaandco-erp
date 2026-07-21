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
    // Fallback sans filtre si la colonne spa_id n'existe pas encore en DB
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
}): Promise<Client> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...payload, loyalty_points: 0, is_vip: false, total_spent: 0, visits_count: 0 } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Client
}
