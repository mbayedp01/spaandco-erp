import { getServices } from '@/lib/db/services'
import { getCurrentSpaId } from '@/lib/spa'
import { Header } from '@/components/layout/header'
import { ServicesView } from './services-view'

export default async function ServicesPage() {
  const spaId    = getCurrentSpaId()
  const services = await getServices(spaId)
  return (
    <>
      <Header title="Prestations" />
      <ServicesView services={services} />
    </>
  )
}
