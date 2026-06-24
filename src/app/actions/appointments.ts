'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

export async function createAppointmentAction(formData: FormData): Promise<void> {
  const spaId        = getCurrentSpaId()
  const client_name  = String(formData.get('client_name')  ?? '').trim()
  const staff_name   = String(formData.get('staff_name')   ?? '').trim()
  const service_name = String(formData.get('service_name') ?? '').trim()
  const date         = String(formData.get('date')         ?? '').trim()
  const time         = String(formData.get('time')         ?? '').trim()
  const duration     = Number(formData.get('duration'))    || 60
  const price        = Number(formData.get('price'))       || 0

  if (!client_name || !date || !time) throw new Error('Client, date et heure requis')

  const supabase = createServerClient()
  const { error } = await supabase.from('appointments').insert({
    client_name, staff_name: staff_name || null,
    service_name: service_name || null,
    date, time, duration, price,
    status: 'confirmed',
    spa_id: spaId,
  } as any)

  if (error) throw new Error(error.message)
  revalidatePath('/appointments')
  revalidatePath('/dashboard')
  revalidatePath('/planning')
}

export async function updateAppointmentStatusAction(id: string, status: string): Promise<void> {
  const supabase = createServerClient()
  const qb = supabase.from('appointments') as any
  const { error } = await qb.update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/appointments')
  revalidatePath('/dashboard')
  revalidatePath('/planning')
}
