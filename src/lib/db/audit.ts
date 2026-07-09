import { createServerClient } from '@/lib/supabase/server'

export interface AuditLogEntry {
  id: string
  actor_email: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_name: string | null
  created_at: string
}

export async function getRecentAuditLogs(limit = 20): Promise<AuditLogEntry[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await (supabase.from('audit_log') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) {
      console.error('getRecentAuditLogs:', error.message)
      return []
    }
    return (data as AuditLogEntry[] | null) ?? []
  } catch {
    return []
  }
}
