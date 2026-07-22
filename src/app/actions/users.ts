'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/user-role'
import { updateUserProfile } from '@/lib/db/users'
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

  // Admin API via fetch brut (compatible nouveau format de clé Supabase sb_secret_...)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    }),
  })

  const json = await resp.json()
  if (!resp.ok) {
    const msg = json?.msg || json?.message || json?.error_description || `Erreur ${resp.status}`
    return { error: msg }
  }

  const userId: string | undefined = json?.id
  if (!userId) return { error: 'Création échouée — aucun utilisateur retourné' }

  const data = { user: { id: userId } }

  // Upsert dans user_profiles pour garantir rôle et nom corrects
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
  revalidatePath('/users')
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
