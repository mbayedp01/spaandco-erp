'use server'

import { revalidatePath } from 'next/cache'
import { addCashTransaction, updateTransactionPerformers } from '@/lib/db/cash'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
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
