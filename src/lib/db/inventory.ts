import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type InventoryItem = Database['public']['Tables']['inventory']['Row']

export async function getInventory(): Promise<InventoryItem[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name')
  if (error) console.error('getInventory:', error.message)
  return (data as InventoryItem[] | null) ?? []
}

export async function updateStock(id: string, quantity: number): Promise<void> {
  const supabase = createServerClient()
  const qb = (supabase.from('inventory') as any)
  const { error } = await qb.update({ quantity }).eq('id', id)
  if (error) throw new Error(error.message)
}
