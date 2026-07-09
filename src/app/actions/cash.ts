'use server'

import { revalidatePath } from 'next/cache'
import { addCashTransaction } from '@/lib/db/cash'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

export async function addTransactionAction(formData: FormData) {
  const label          = String(formData.get('label')          ?? '').trim()
  const category       = String(formData.get('category')       ?? 'Divers').trim()
  const amount         = Number(formData.get('amount'))
  const type           = String(formData.get('type')) as 'recette' | 'charge'
  const payment_method = String(formData.get('payment_method') ?? 'Cash').trim()

  if (!label || !amount || !type) throw new Error('Champs requis manquants')

  const supabase  = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const created_by = user?.user_metadata?.name ?? user?.email ?? null
  const spa_id     = getCurrentSpaId()

  await addCashTransaction({ label, category, amount, type, payment_method, created_by, spa_id })
  revalidatePath('/cash')
  revalidatePath('/accounting')
}
