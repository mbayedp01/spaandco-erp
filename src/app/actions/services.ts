'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

export async function createServiceAction(formData: FormData): Promise<void> {
  const name        = String(formData.get('name')        ?? '').trim()
  const category    = String(formData.get('category')    ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration    = Number(formData.get('duration'))   || 60
  const price       = Number(formData.get('price'))      || 0
  const active      = formData.get('active') !== 'false'
  const spa_id      = getCurrentSpaId()

  if (!name || !category) throw new Error('Nom et catégorie requis')

  const supabase = createServerClient()
  const { error } = await supabase.from('services').insert({
    name, category, description: description || null, duration, price, active, spa_id,
  } as any)
  if (error) throw new Error(error.message)
  revalidatePath('/services')
}

export async function updateServiceAction(id: string, formData: FormData): Promise<void> {
  const name        = String(formData.get('name')        ?? '').trim()
  const category    = String(formData.get('category')    ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const duration    = Number(formData.get('duration'))   || 60
  const price       = Number(formData.get('price'))      || 0
  const active      = formData.get('active') === 'true'

  if (!name || !category) throw new Error('Nom et catégorie requis')

  const supabase = createServerClient()
  const { error } = await (supabase.from('services') as any)
    .update({ name, category, description: description || null, duration, price, active })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/services')
}

export async function deleteServiceAction(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await (supabase.from('services') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/services')
}
