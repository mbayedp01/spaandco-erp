'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

export async function createInventoryAction(formData: FormData): Promise<void> {
  const spaId       = getCurrentSpaId()
  const name        = String(formData.get('name')        ?? '').trim()
  const category    = String(formData.get('category')    ?? '').trim()
  const quantity    = Number(formData.get('quantity'))   || 0
  const unit        = String(formData.get('unit')        ?? '').trim()
  const min_quantity= Number(formData.get('min_quantity'))|| 5
  const supplier    = String(formData.get('supplier')    ?? '').trim()
  const unit_price  = Number(formData.get('unit_price')) || null

  if (!name) throw new Error('Nom du produit requis')

  const supabase = createServerClient()
  const { error } = await supabase.from('inventory').insert({
    name, quantity, min_quantity,
    category: category || null,
    unit: unit || null,
    supplier: supplier || null,
    unit_price,
    spa_id: spaId,
  } as any)

  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}

export async function updateInventoryAction(id: string, formData: FormData): Promise<void> {
  const name         = String(formData.get('name')         ?? '').trim()
  const category     = String(formData.get('category')     ?? '').trim()
  const quantity     = Number(formData.get('quantity'))    || 0
  const unit         = String(formData.get('unit')         ?? '').trim()
  const min_quantity = Number(formData.get('min_quantity')) || 5
  const supplier     = String(formData.get('supplier')     ?? '').trim()
  const unit_price   = Number(formData.get('unit_price'))  || null

  if (!name) throw new Error('Nom du produit requis')

  const supabase = createServerClient()
  const { error } = await (supabase.from('inventory') as any)
    .update({ name, quantity, min_quantity, category: category || null, unit: unit || null, supplier: supplier || null, unit_price })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}

export async function deleteInventoryAction(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await (supabase.from('inventory') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/inventory')
}
