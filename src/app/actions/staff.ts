'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole } from '@/lib/user-role'
import { logAction } from '@/lib/audit'
import type { Database } from '@/lib/supabase/types'

type StaffMember = Database['public']['Tables']['staff']['Row']

export async function createStaffAction(formData: FormData): Promise<void> {
  const spaId      = getCurrentSpaId()
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name  = String(formData.get('last_name')  ?? '').trim()
  const email      = String(formData.get('email')      ?? '').trim()
  const role       = String(formData.get('role')       ?? '').trim()
  const specialty  = String(formData.get('specialty')  ?? '').trim()
  const salary     = Number(formData.get('salary'))    || null

  if (!first_name || !last_name || !role) throw new Error('Prénom, nom et rôle requis')

  const supabase = createServerClient()
  const { error } = await supabase.from('staff').insert({
    first_name, last_name,
    email: email || null,
    role,
    specialty: specialty || null,
    salary,
    status: 'active',
    spa_id: spaId,
  } as any)

  if (error) throw new Error(error.message)
  revalidatePath('/staff')
  revalidatePath('/planning')
}

export async function updateStaffAction(id: string, formData: FormData): Promise<void> {
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name  = String(formData.get('last_name')  ?? '').trim()
  const email      = String(formData.get('email')      ?? '').trim()
  const role       = String(formData.get('role')       ?? '').trim()
  const specialty  = String(formData.get('specialty')  ?? '').trim()
  const salary     = Number(formData.get('salary'))    || null
  const status     = String(formData.get('status')     ?? 'active').trim()
  const rating     = Number(formData.get('rating'))    || null

  if (!first_name || !last_name || !role) throw new Error('Prénom, nom et rôle requis')

  const supabase = createServerClient()
  const { error } = await (supabase.from('staff') as any)
    .update({ first_name, last_name, email: email || null, role, specialty: specialty || null, salary, status, rating })
    .eq('id', id)
  if (error) throw new Error(error.message)

  const userRole = await getCurrentUserRole()
  if (userRole === 'caissier') {
    const { data: { user } } = await supabase.auth.getUser()
    await logAction({
      actor_email: user?.email ?? '',
      actor_role:  userRole,
      action:      'updated',
      entity_type: 'staff',
      entity_name: `${first_name} ${last_name}`,
      spa_id:      getCurrentSpaId(),
    })
  }

  revalidatePath('/staff')
  revalidatePath('/planning')
}

export async function deleteStaffAction(id: string): Promise<void> {
  const supabase = createServerClient()

  const { data: staffData } = await (supabase.from('staff') as any)
    .select('first_name, last_name')
    .eq('id', id)
    .single()

  const { error } = await (supabase.from('staff') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)

  const userRole = await getCurrentUserRole()
  if (userRole === 'caissier') {
    const { data: { user } } = await supabase.auth.getUser()
    const name = staffData ? `${staffData.first_name} ${staffData.last_name}` : id
    await logAction({
      actor_email: user?.email ?? '',
      actor_role:  userRole,
      action:      'deleted',
      entity_type: 'staff',
      entity_name: name,
      spa_id:      getCurrentSpaId(),
    })
  }

  revalidatePath('/staff')
  revalidatePath('/planning')
}
