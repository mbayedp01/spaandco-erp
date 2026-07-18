import { Header } from '@/components/layout/header'
import { SettingsView } from './settings-view'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'
import { getRecentAuditLogs } from '@/lib/db/audit'
import { getCurrentUserRole } from '@/lib/user-role'
import { appUsers } from '@/lib/mock-data'

export default async function SettingsPage() {
  const [establishments, logs, role] = await Promise.all([
    getEstablishments(),
    getRecentAuditLogs(50),
    getCurrentUserRole(),
  ])

  const currentSpaId = getCurrentSpaId()
  const current = establishments.find((e) => e.id === currentSpaId) ?? establishments[0] ?? null

  return (
    <>
      <Header title="Paramètres" />
      <SettingsView
        establishment={current}
        establishments={establishments}
        logs={logs}
        users={appUsers}
        isAdmin={role === 'admin'}
      />
    </>
  )
}
