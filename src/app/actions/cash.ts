'use server'

import { revalidatePath } from 'next/cache'
import { addCashTransaction } from '@/lib/db/cash'

export async function addTransactionAction(formData: FormData) {
  const label          = String(formData.get('label')          ?? '').trim()
  const category       = String(formData.get('category')       ?? 'Divers').trim()
  const amount         = Number(formData.get('amount'))
  const type           = String(formData.get('type')) as 'recette' | 'charge'
  const payment_method = String(formData.get('payment_method') ?? 'Cash').trim()

  if (!label || !amount || !type) throw new Error('Champs requis manquants')

  await addCashTransaction({ label, category, amount, type, payment_method })
  revalidatePath('/cash')
  revalidatePath('/accounting')
}
