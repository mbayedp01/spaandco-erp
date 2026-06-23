import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Client = Database['public']['Tables']['clients']['Row']

export async function getClients(): Promise<Client[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('total_spent', { ascending: false })
  if (error) console.error('getClients:', error.message)
  return (data as Client[] | null) ?? []
}

export async function createClient(payload: {
  first_name: string
  last_name: string
  email: string
  phone: string
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
