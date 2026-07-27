'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getCurrentSpaId } from '@/lib/spa'

// Insert via service role key pour contourner RLS sur audit_log
async function insertAuditLog(entry: {
  actor_email: string
  actor_role: string
  action: string
  entity_type: string
  entity_name: string
  details: Record<string, unknown> | null
  spa_id: string | null
}): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
    body: JSON.stringify(entry),
  })
}

export async function logAction(params: {
  actor_email: string
  actor_role: string
  action: 'created' | 'updated' | 'deleted'
  entity_type: string
  entity_name: string
  details?: Record<string, unknown>
  spa_id: string | null
}): Promise<void> {
  try {
    await insertAuditLog({
      actor_email: params.actor_email,
      actor_role:  params.actor_role,
      action:      params.action,
      entity_type: params.entity_type,
      entity_name: params.entity_name,
      details:     params.details ?? null,
      spa_id:      params.spa_id,
    })
  } catch {
    // Non-blocking
  }
}

export async function logCurrentAction(params: {
  action: 'created' | 'updated' | 'deleted'
  entity_type: string
  entity_name: string
  details?: Record<string, unknown>
  spa_id?: string | null
}): Promise<void> {
  try {
    // Lire la session depuis le cookie (fonctionne dans Server Actions)
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const actor_email = user?.email ?? 'admin@dev.local'
    const actor_role  = (user?.user_metadata?.role as string) ?? 'admin'
    const spa_id = params.spa_id !== undefined ? params.spa_id : (getCurrentSpaId() ?? null)

    await logAction({
      actor_email,
      actor_role,
      action:      params.action,
      entity_type: params.entity_type,
      entity_name: params.entity_name,
      details:     params.details,
      spa_id,
    })
  } catch {
    // Non-blocking
  }
}
