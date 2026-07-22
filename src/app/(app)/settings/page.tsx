import { Header } from '@/components/layout/header'
import { SettingsView } from './settings-view'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'
import { getRecentAuditLogs } from '@/lib/db/audit'
import { getCurrentUserRole } from '@/lib/user-role'
import { getAppUsers } from '@/lib/db/users'

export default async function SettingsPage() {
  const currentSpaId = getCurrentSpaId()

  const [establishments, logs, role, users] = await Promise.all([
    getEstablishments(),
    getRecentAuditLogs(100, currentSpaId),
    getCurrentUserRole(),
    getAppUsers(),
  ])
  const current = establishments.find((e) => e.id === currentSpaId) ?? establishments[0] ?? null

  return (
    <>
      <Header title="Paramètres" />
      <SettingsView
        establishment={current}
        establishments={establishments}
        logs={logs}
        users={users}
        isAdmin={role === 'admin'}
      />
    </>
  )
}
