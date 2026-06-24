'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function createSubscriptionAction(formData: FormData): Promise<void> {
  const client_name    = String(formData.get('client_name') ?? '').trim()
  const plan_name      = String(formData.get('plan_name')   ?? '').trim()
  const plan_id        = String(formData.get('plan_id')     ?? '').trim() || null
  const since          = String(formData.get('since')       ?? '') || new Date().toISOString().split('T')[0]
  const soins_restants = String(formData.get('soins_restants') ?? '').trim() || null

  if (!client_name || !plan_name) throw new Error('Nom du client et formule requis')

  // Calcule next_billing = since + 1 mois
  const sinceDate = new Date(since)
  sinceDate.setMonth(sinceDate.getMonth() + 1)
  const next_billing = sinceDate.toISOString().split('T')[0]

  const supabase = createServerClient()
  const { error } = await supabase.from('memberships').insert({
    client_name,
    plan_name,
    plan_id,
    since,
    next_billing,
    status: 'actif',
    soins_restants,
  } as any)

  if (error) throw new Error(error.message)
  revalidatePath('/subscriptions')
}
