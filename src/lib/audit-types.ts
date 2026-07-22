export interface AuditLogEntry {
  id: string
  actor_email: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_name: string | null
  spa_id: string | null
  created_at: string
}
