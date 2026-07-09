import { createServerClient } from '@/lib/supabase/server'

export async function logAction(params: {
  actor_email: string
  actor_role: string
  action: 'created' | 'updated' | 'deleted'
  entity_type: string
  entity_name: string
  details?: Record<string, unknown>
  spa_id: string
}): Promise<void> {
  try {
    const supabase = createServerClient()
    await (supabase.from('audit_log') as any).insert({
      actor_email: params.actor_email,
      actor_role: params.actor_role,
      action: params.action,
      entity_type: params.entity_type,
      entity_name: params.entity_name,
      details: params.details ?? null,
      spa_id: params.spa_id,
    })
  } catch {
    // Non-blocking — don't throw if logging fails
  }
}
