import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type CashTransaction = Database['public']['Tables']['cash_transactions']['Row']

export async function getCashTransactions(spaId?: string): Promise<CashTransaction[]> {
  const supabase = createServerClient()
  let query = supabase
    .from('cash_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (spaId) query = query.eq('spa_id', spaId)
  const { data, error } = await query
  if (error) console.error('getCashTransactions:', error.message)
  return (data as CashTransaction[] | null) ?? []
}

export async function addCashTransaction(payload: {
  label: string
  category: string
  amount: number
  type: 'recette' | 'charge'
  payment_method: string
  payment_splits?: { method: string; amount: number }[]
  date?: string
  spa_id?: string
  created_by?: string | null
  performed_by?: string[]
  line_items?: { name: string; price: number; qty: number; performers: string[] }[]
}): Promise<{ data?: CashTransaction; error?: string }> {
  const supabase = createServerClient()
  const row = { ...payload, date: payload.date ?? new Date().toISOString().split('T')[0] } as any
  const { data, error } = await supabase
    .from('cash_transactions')
    .insert(row)
    .select()
    .single()
  if (error && error.message.includes('line_items')) {
    delete row.line_items
    const retry = await supabase.from('cash_transactions').insert(row as any).select().single()
    if (retry.error) return { error: retry.error.message }
    return { data: retry.data as CashTransaction }
  }
  if (error) return { error: error.message }
  return { data: data as CashTransaction }
}

// Supprime une transaction de caisse (réservé à l'admin)
export async function deleteCashTransaction(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { error } = await (supabase.from('cash_transactions') as any).delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// Met à jour la liste des praticiens ayant réalisé la prestation (modifier / annuler)
export async function updateTransactionPerformers(
  id: string,
  performers: string[],
): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { error } = await (supabase.from('cash_transactions') as any)
    .update({ performed_by: performers })
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}
