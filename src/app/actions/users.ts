'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUserRole } from '@/lib/user-role'
import { updateUserProfile } from '@/lib/db/users'
import { logCurrentAction } from '@/lib/audit'
import { ROLE_LABELS } from '@/lib/roles'

function adminApiError(status: number, json: any): string {
  const msg: string = json?.msg || json?.message || json?.error_description || ''
  if (status === 401 || /invalid api key/i.test(msg)) {
    return 'Clé d\'administration Supabase invalide sur le serveur (variable SUPABASE_SERVICE_ROLE_KEY). Mettez-la à jour dans la configuration de l\'hébergement puis redéployez.'
  }
  return msg || `Erreur ${status}`
}

async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin'
}

export async function updateUserRoleAction(
  userId: string,
  role: string,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: 'Permission refusée' }
  if (!(role in ROLE_LABELS)) return { error: 'Rôle invalide' }

  // Permissions are read from auth user_metadata, not user_profiles.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    body: JSON.stringify({ user_metadata: { role } }),
  })
  if (!resp.ok) {
    const json = await resp.json().catch(() => ({}))
    return { error: adminApiError(resp.status, json) }
  }

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
  if (!(await isAdmin())) return { error: 'Permission refusée' }
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
  spa_id?: string,
): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: 'Permission refusée' }

  // Admin API via fetch brut (compatible nouveau format de clé Supabase sb_secret_...)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const userMeta: Record<string, string> = { name, role }
  if (spa_id) userMeta.spa_id = spa_id

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
      user_metadata: userMeta,
    }),
  })

  const json = await resp.json().catch(() => ({}))
  if (!resp.ok) return { error: adminApiError(resp.status, json) }

  const userId: string | undefined = json?.id
  if (!userId) return { error: 'Création échouée — aucun utilisateur retourné' }

  const data = { user: { id: userId } }

  // Upsert dans user_profiles pour garantir rôle et nom corrects
  const supabase = createAdminClient()
  const { error: profileError } = await (supabase.from('user_profiles') as any).upsert({
    id: data.user.id,
    email,
    name,
    role,
    status: 'actif',
  })
  if (profileError) console.error('createUserAction profile:', profileError.message)

  await logCurrentAction({ action: 'created', entity_type: 'user', entity_name: `${name} (${role})`, spa_id: null })
  revalidatePath('/settings')
  revalidatePath('/users')
  return {}
}

export async function deleteUserAction(userId: string): Promise<{ error?: string }> {
  if (!(await isAdmin())) return { error: 'Permission refusée' }
  // Désactivation soft : on ne supprime pas l'auth user, on le marque inactif
  const result = await updateUserProfile(userId, { status: 'inactif' })
  if (result.error) return { error: result.error }
  revalidatePath('/settings')
  return {}
}
