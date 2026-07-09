import { createServerClient } from '@/lib/supabase/server'
import type { AuditLogEntry } from '@/lib/audit-types'

export type { AuditLogEntry }

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
