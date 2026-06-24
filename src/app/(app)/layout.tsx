import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SpaProvider } from '@/components/layout/spa-context'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [establishments, currentSpaId] = await Promise.all([
    getEstablishments(),
    Promise.resolve(getCurrentSpaId()),
  ])

  return (
    <SpaProvider establishments={establishments} currentSpaId={currentSpaId}>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <Sidebar establishments={establishments} currentSpaId={currentSpaId} />
        <div className="flex flex-1 flex-col overflow-hidden pb-16 lg:pb-0">
          {children}
        </div>
      </div>
      <BottomNav />
    </SpaProvider>
  )
}
