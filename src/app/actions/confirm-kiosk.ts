'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function confirmKioskAppointment(
  appointmentId: string,
  clientName: string,
  phone: string | null,
  spaId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // 1. Créer ou retrouver le client par téléphone
    let clientId: string | null = null
    if (phone) {
      const { data: existing } = await (supabase.from('clients') as any)
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle()

      if (existing) {
        clientId = existing.id
      } else {
        const parts = clientName.trim().split(' ')
        const firstName = parts[0] ?? clientName
        const lastName  = parts.slice(1).join(' ') || '—'
        const { data: created } = await (supabase.from('clients') as any)
          .insert({
            first_name:    firstName,
            last_name:     lastName,
            phone:         phone.trim(),
            spa_id:        spaId,
            join_date:     new Date().toISOString().split('T')[0],
            loyalty_points: 0,
            is_vip:        false,
            total_spent:   0,
            visits_count:  0,
          })
          .select('id')
          .single()
        clientId = created?.id ?? null
      }
    }

    // 2. Confirmer le rendez-vous
    const update: Record<string, unknown> = { status: 'confirmed' }
    if (clientId) update.client_id = clientId

    const { error } = await (supabase.from('appointments') as any)
      .update(update)
      .eq('id', appointmentId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: String(e) }
  }
}
