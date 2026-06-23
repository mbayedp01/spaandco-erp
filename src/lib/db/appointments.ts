import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date')
  if (error) console.error('getAppointments:', error.message)
  return (data as Appointment[] | null) ?? []
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0]
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', today)
    .order('time')
  if (error) console.error('getTodayAppointments:', error.message)
  return (data as Appointment[] | null) ?? []
}

export async function createAppointment(payload: {
  client_name: string
  staff_name: string
  service_name: string
  date: string
  time: string
  duration: number
  price: number
  status?: string
}): Promise<Appointment> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...payload, status: payload.status ?? 'pending' } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Appointment
}
