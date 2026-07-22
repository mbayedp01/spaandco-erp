'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/clients'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/user-role'
import { getCurrentSpaId } from '@/lib/spa'
import { logCurrentAction } from '@/lib/audit'

export async function createClientAction(formData: FormData): Promise<{ error?: string }> {
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name  = String(formData.get('last_name')  ?? '').trim()
  const email      = String(formData.get('email')      ?? '').trim()
  const phone      = String(formData.get('phone')      ?? '').trim()
  const birth_date = String(formData.get('birth_date') ?? '').trim() || null

  if (!first_name || !last_name) return { error: 'Prénom et nom requis' }

  const spa_id = getCurrentSpaId()
  const result = await createClient({ first_name, last_name, email, phone, birth_date, spa_id })
  if (result.error) {
    if (result.error.includes('clients_email_spa_key') || result.error.includes('unique'))
      return { error: 'Cette adresse email est déjà utilisée par un autre client dans ce spa.' }
    return { error: result.error }
  }
  await logCurrentAction({ action: 'created', entity_type: 'client', entity_name: `${first_name} ${last_name}`, spa_id })
  revalidatePath('/clients')
  return {}
}

export async function updateClientAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name  = String(formData.get('last_name')  ?? '').trim()
  const email      = String(formData.get('email')      ?? '').trim()
  const phone      = String(formData.get('phone')      ?? '').trim()
  const birth_date = String(formData.get('birth_date') ?? '').trim() || null

  if (!first_name || !last_name) return { error: 'Prénom et nom requis' }

  const supabase = createServerClient()
  const { error } = await (supabase.from('clients') as any)
    .update({ first_name, last_name, email: email || null, phone: phone || null, birth_date })
    .eq('id', id)
  if (error) return { error: error.message }

  await logCurrentAction({ action: 'updated', entity_type: 'client', entity_name: `${first_name} ${last_name}` })
  revalidatePath('/clients')
  return {}
}

export async function deleteClientAction(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { data: clientData } = await (supabase.from('clients') as any)
    .select('first_name, last_name').eq('id', id).single()
  const { error } = await (supabase.from('clients') as any).delete().eq('id', id)
  if (error) return { error: error.message }

  const name = clientData ? `${clientData.first_name} ${clientData.last_name}` : id
  await logCurrentAction({ action: 'deleted', entity_type: 'client', entity_name: name })
  revalidatePath('/clients')
  return {}
}
