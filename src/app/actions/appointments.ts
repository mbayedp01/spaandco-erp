'use server'

import { revalidatePath } from 'next/cache'
import { createAppointment } from '@/lib/db/appointments'

export async function createAppointmentAction(formData: FormData) {
  const client_name  = String(formData.get('client_name')  ?? '').trim()
  const staff_name   = String(formData.get('staff_name')   ?? '').trim()
  const service_name = String(formData.get('service_name') ?? '').trim()
  const date         = String(formData.get('date')         ?? '').trim()
  const time         = String(formData.get('time')         ?? '').trim()
  const duration     = Number(formData.get('duration'))
  const price        = Number(formData.get('price'))

  if (!client_name || !date || !time) throw new Error('Champs requis manquants')

  await createAppointment({ client_name, staff_name, service_name, date, time, duration, price, status: 'confirmed' })
  revalidatePath('/appointments')
  revalidatePath('/planning')
}
