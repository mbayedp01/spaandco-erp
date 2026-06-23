import { Sidebar } from '@/components/layout/sidebar'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [establishments, currentSpaId] = await Promise.all([
    getEstablishments(),
    Promise.resolve(getCurrentSpaId()),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <Sidebar establishments={establishments} currentSpaId={currentSpaId} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
