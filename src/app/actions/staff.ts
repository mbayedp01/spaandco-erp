'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'
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
