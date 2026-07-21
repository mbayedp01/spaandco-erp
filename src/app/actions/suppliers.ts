'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

export async function createSupplierAction(formData: FormData): Promise<{ error?: string }> {
  const spaId         = getCurrentSpaId()
  const name          = String(formData.get('name')          ?? '').trim()
  const category      = String(formData.get('category')      ?? '').trim()
  const contact       = String(formData.get('contact')       ?? '').trim()
  const phone         = String(formData.get('phone')         ?? '').trim()
  const email         = String(formData.get('email')         ?? '').trim()
  const monthly_spend = Number(formData.get('monthly_spend')) || 0

  if (!name) return { error: 'Nom du fournisseur requis' }

  const supabase = createServerClient()
  const { error } = await supabase.from('suppliers').insert({
    name,
    category: category || null,
    contact: contact || null,
    phone: phone || null,
    email: email || null,
    monthly_spend,
    status: 'actif',
    pending_orders: 0,
    spa_id: spaId,
  } as any)

  if (error) return { error: error.message }
  revalidatePath('/suppliers')
  return {}
}

export async function updateSupplierAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const name          = String(formData.get('name')          ?? '').trim()
  const category      = String(formData.get('category')      ?? '').trim()
  const contact       = String(formData.get('contact')       ?? '').trim()
  const phone         = String(formData.get('phone')         ?? '').trim()
  const email         = String(formData.get('email')         ?? '').trim()
  const monthly_spend = Number(formData.get('monthly_spend')) || 0
  const status        = String(formData.get('status')        ?? 'actif').trim()

  if (!name) return { error: 'Nom du fournisseur requis' }

  const supabase = createServerClient()
  const { error } = await (supabase.from('suppliers') as any)
    .update({ name, category: category || null, contact: contact || null, phone: phone || null, email: email || null, monthly_spend, status })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/suppliers')
  return {}
}

export async function deleteSupplierAction(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { error } = await (supabase.from('suppliers') as any).delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/suppliers')
  return {}
}
