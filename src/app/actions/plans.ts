'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/user-role'
import { getCurrentSpaId } from '@/lib/spa'

async function requireAdmin() {
  const role = await getCurrentUserRole()
  if (role !== 'admin') throw new Error('Permission refusée')
}

export interface PlanFormData {
  name: string
  price: number
  remise: number
  color: string
  avantages: string[]
  description: string
  duration_days: number | null
  sessions_count: number | null
  payment_frequency: string
  services: string[]
  conditions: string
  active: boolean
}

export async function createPlanAction(data: PlanFormData): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServerClient()
  const spaId = getCurrentSpaId()
  const { error } = await (supabase.from('membership_plans') as any).insert({
    ...data,
    spa_id: spaId,
  })
  if (error) return { error: error.message }
  revalidatePath('/subscriptions')
  return {}
}

export async function updatePlanAction(id: string, data: Partial<PlanFormData>): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServerClient()
  const { error } = await (supabase.from('membership_plans') as any).update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/subscriptions')
  return {}
}

export async function deletePlanAction(id: string): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServerClient()
  const { error } = await supabase.from('membership_plans').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/subscriptions')
  return {}
}

export async function togglePlanAction(id: string, currentActive: boolean): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = createServerClient()
  const { error } = await (supabase.from('membership_plans') as any).update({ active: !currentActive }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/subscriptions')
  return {}
}
