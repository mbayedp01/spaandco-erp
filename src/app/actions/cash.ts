'use server'

import { revalidatePath } from 'next/cache'
import { addCashTransaction, updateTransactionPerformers, deleteCashTransaction } from '@/lib/db/cash'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole } from '@/lib/user-role'
import { logCurrentAction } from '@/lib/audit'

export async function addTransactionAction(formData: FormData): Promise<{ error?: string }> {
  const label            = String(formData.get('label')          ?? '').trim()
  const category         = String(formData.get('category')       ?? 'Divers').trim()
  const amount           = Number(formData.get('amount'))
  const type             = String(formData.get('type')) as 'recette' | 'charge'
  const performed_by     = (formData.getAll('performed_by') as string[]).map(s => s.trim()).filter(Boolean)
  const splitsRaw        = String(formData.get('payment_splits') ?? '')
  const lineItemsRaw     = String(formData.get('line_items') ?? '')

  if (!label || !amount || !type) return { error: 'Champs requis manquants' }

  let payment_method = String(formData.get('payment_method') ?? 'Cash').trim()
  let payment_splits: { method: string; amount: number }[] | undefined

  if (splitsRaw) {
    try {
      const parsed = JSON.parse(splitsRaw) as { method: string; amount: number }[]
      const clean = parsed
        .map(s => ({ method: String(s.method).trim(), amount: Number(s.amount) }))
        .filter(s => s.method && s.amount > 0)
      if (clean.length > 0) {
        const sum = clean.reduce((s, l) => s + l.amount, 0)
        if (Math.abs(sum - amount) > 0.01) {
          return { error: `La répartition (${sum.toLocaleString('fr-FR')} F) ne correspond pas au montant total (${amount.toLocaleString('fr-FR')} F).` }
        }
        payment_splits = clean
        payment_method = clean.length > 1 ? 'Mixte' : clean[0].method
      }
    } catch {
      return { error: 'Répartition de paiement invalide' }
    }
  }

  let line_items: { name: string; price: number; qty: number; performers: string[] }[] | undefined
  if (lineItemsRaw) {
    try {
      line_items = JSON.parse(lineItemsRaw)
    } catch { /* ignore invalid JSON */ }
  }

  const supabase  = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const created_by = user?.user_metadata?.name ?? user?.email ?? null
  const spa_id     = await getCurrentSpaId()

  const result = await addCashTransaction({ label, category, amount, type, payment_method, payment_splits, created_by, spa_id, performed_by, line_items })
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
