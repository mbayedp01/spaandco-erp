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
  date?: string
  spa_id?: string
  created_by?: string | null
}): Promise<CashTransaction> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('cash_transactions')
    .insert({ ...payload, date: payload.date ?? new Date().toISOString().split('T')[0] } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as CashTransaction
}
