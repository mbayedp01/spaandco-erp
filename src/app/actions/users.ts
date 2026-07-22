'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/user-role'
import { updateUserProfile } from '@/lib/db/users'
import { createClient } from '@supabase/supabase-js'
import { logCurrentAction } from '@/lib/audit'

async function requireAdmin() {
  const role = await getCurrentUserRole()
  if (role !== 'admin') throw new Error('Permission refusée')
}

export async function updateUserRoleAction(
  userId: string,
  role: string,
): Promise<{ error?: string }> {
  await requireAdmin()
  const result = await updateUserProfile(userId, { role })
  if (result.error) return { error: result.error }
  await logCurrentAction({ action: 'updated', entity_type: 'user', entity_name: `Rôle → ${role}`, spa_id: null })
  revalidatePath('/settings')
  return {}
}

export async function toggleUserStatusAction(
  userId: string,
  currentStatus: string,
): Promise<{ error?: string }> {
  await requireAdmin()
  const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif'
  const result = await updateUserProfile(userId, { status: newStatus })
  if (result.error) return { error: result.error }
  revalidatePath('/settings')
  return {}
}

export async function createUserAction(
  email: string,
  name: string,
  role: string,
  password: string,
): Promise<{ error?: string }> {
  await requireAdmin()

  // Création via client anon (sans session cookie) pour ne pas écraser la session admin
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: 'Création échouée' }

  // Insert explicite dans user_profiles (le trigger le fait aussi, mais on précise role/name)
  const supabase = createServerClient()
  await (supabase.from('user_profiles') as any).upsert({
    id: data.user.id,
    email,
    name,
    role,
    status: 'actif',
  })

  await logCurrentAction({ action: 'created', entity_type: 'user', entity_name: `${name} (${role})`, spa_id: null })
  revalidatePath('/settings')
  return {}
}

export async function deleteUserAction(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  // Désactivation soft : on ne supprime pas l'auth user, on le marque inactif
  const result = await updateUserProfile(userId, { status: 'inactif' })
  if (result.error) return { error: result.error }
  revalidatePath('/settings')
  return {}
}
