'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
import { logCurrentAction } from '@/lib/audit'

export async function createServiceAction(formData: FormData): Promise<{ error?: string }> {
  const name        = String(formData.get('name')        ?? '').trim()
  const category    = String(formData.get('category')    ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration    = Number(formData.get('duration'))   || 60
  const price       = Number(formData.get('price'))      || 0
  const active      = formData.get('active') !== 'false'
  const spa_id      = getCurrentSpaId()

  if (!name || !category) return { error: 'Nom et catégorie requis' }

  const supabase = createServerClient()
  const { error } = await supabase.from('services').insert({
    name, category, description: description || null, duration, price, active, spa_id,
  } as any)
  if (error) return { error: error.message }
  await logCurrentAction({ action: 'created', entity_type: 'service', entity_name: name, spa_id })
  revalidatePath('/services')
  return {}
}

export async function updateServiceAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const name        = String(formData.get('name')        ?? '').trim()
  const category    = String(formData.get('category')    ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration    = Number(formData.get('duration'))   || 60
  const price       = Number(formData.get('price'))      || 0
  const active      = formData.get('active') === 'true'

  if (!name || !category) return { error: 'Nom et catégorie requis' }

  const supabase = createServerClient()
  const { error } = await (supabase.from('services') as any)
    .update({ name, category, description: description || null, duration, price, active })
    .eq('id', id)
  if (error) return { error: error.message }
  await logCurrentAction({ action: 'updated', entity_type: 'service', entity_name: name })
  revalidatePath('/services')
  return {}
}

export async function deleteServiceAction(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { data } = await (supabase.from('services') as any).select('name').eq('id', id).single()
  const { error } = await (supabase.from('services') as any).delete().eq('id', id)
  if (error) return { error: error.message }
  await logCurrentAction({ action: 'deleted', entity_type: 'service', entity_name: data?.name ?? id })
  revalidatePath('/services')
  return {}
}
