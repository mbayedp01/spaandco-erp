'use server'

import { revalidatePath } from 'next/cache'
import { addCashTransaction, updateTransactionPerformers, deleteCashTransaction } from '@/lib/db/cash'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole } from '@/lib/user-role'
import { logCurrentAction } from '@/lib/audit'

export async function addTransactionAction(formData: FormData): Promise<{ error?: string }> {
  const label          = String(formData.get('label')          ?? '').trim()
  const category       = String(formData.get('category')       ?? 'Divers').trim()
  const amount         = Number(formData.get('amount'))
  const type           = String(formData.get('type')) as 'recette' | 'charge'
  const payment_method = String(formData.get('payment_method') ?? 'Cash').trim()
  const performed_by   = (formData.getAll('performed_by') as string[]).map(s => s.trim()).filter(Boolean)

  if (!label || !amount || !type) return { error: 'Champs requis manquants' }

  const supabase  = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const created_by = user?.user_metadata?.name ?? user?.email ?? null
  const spa_id     = await getCurrentSpaId()

  const result = await addCashTransaction({ label, category, amount, type, payment_method, created_by, spa_id, performed_by })
  if (result.error) return { error: result.error }
  await logCurrentAction({ action: 'created', entity_type: 'cash', entity_name: `${label} · ${amount.toLocaleString('fr-FR')} F`, spa_id })
  revalidatePath('/cash')
  revalidatePath('/accounting')
  revalidatePath('/dashboard')
  return {}
}

// Supprimer une transaction de caisse — réservé à l'administrateur
export async function deleteTransactionAction(id: string): Promise<{ error?: string }> {
  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Action réservée à l\'administrateur' }

  const supabase = createServerClient()
  const { data: tx } = await (supabase.from('cash_transactions') as any)
    .select('label, amount').eq('id', id).single()

  const result = await deleteCashTransaction(id)
  if (result.error) return { error: result.error }

  const spa_id = await getCurrentSpaId()
  await logCurrentAction({
    action: 'deleted',
    entity_type: 'cash',
    entity_name: tx ? `${tx.label} · ${Number(tx.amount).toLocaleString('fr-FR')} F` : id,
    spa_id,
  })
  revalidatePath('/cash')
  revalidatePath('/accounting')
  revalidatePath('/dashboard')
  return {}
}

// Modifier / annuler les praticiens d'une transaction (avant ou après la séance)
export async function setTransactionPerformersAction(
  id: string,
  performers: string[],
): Promise<{ error?: string }> {
  const clean = performers.map(s => s.trim()).filter(Boolean)
  const result = await updateTransactionPerformers(id, clean)
  if (result.error) return { error: result.error }
  const spa_id = await getCurrentSpaId()
  await logCurrentAction({
    action: 'updated',
    entity_type: 'cash',
    entity_name: clean.length > 0 ? `Praticien(s) : ${clean.join(', ')}` : 'Praticien(s) retiré(s)',
    spa_id,
  })
  revalidatePath('/cash')
  revalidatePath('/dashboard')
  return {}
}
