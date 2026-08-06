import { createServerClient } from '@/lib/supabase/server'

export interface KioskAppointment {
  id: string
  client_name: string | null
  service_name: string | null
  staff_name: string | null
  date: string
  time: string | null
  duration: number | null
  price: number | null
  status: string
  notes: string | null
  spa_id: string | null
  created_at: string
}

export async function getKioskPendingAppointments(
  limit = 30,
  spaId?: string | null,
): Promise<KioskAppointment[]> {
  try {
    const supabase = createServerClient()
    let q = (supabase.from('appointments') as any)
      .select('id,client_name,service_name,staff_name,date,time,duration,price,status,notes,spa_id,created_at')
      .like('notes', '%Borne kiosque%')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (spaId) q = q.eq('spa_id', spaId)
    const { data, error } = await q
    if (error) { console.error('getKioskPendingAppointments:', error.message); return [] }
    return (data as KioskAppointment[] | null) ?? []
  } catch { return [] }
}
