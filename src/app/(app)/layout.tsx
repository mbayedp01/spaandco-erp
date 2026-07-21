import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SpaProvider } from '@/components/layout/spa-context'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole } from '@/lib/user-role'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [establishments, currentSpaId, userRole] = await Promise.all([
    getEstablishments(),
    Promise.resolve(getCurrentSpaId()),
    getCurrentUserRole(),
  ])

  const spaName = establishments.find(e => e.id === currentSpaId)?.name ?? ''

  const SPA_THEME: Record<string, string> = {
    'Mermoz':  'spa-mermoz',
    'Plateau': 'dark',
  }
  const spaThemeClass = SPA_THEME[spaName] ?? ''

  return (
    <SpaProvider establishments={establishments} currentSpaId={currentSpaId} userRole={userRole}>
      <div className={`flex h-screen overflow-hidden ${spaThemeClass}`}>
        <Sidebar establishments={establishments} currentSpaId={currentSpaId} userRole={userRole} />
        <div className="flex flex-1 flex-col overflow-hidden pb-16 lg:pb-0 bg-stone-50 dark:bg-slate-900">
          {children}
        </div>
      </div>
      <BottomNav />
    </SpaProvider>
  )
}
