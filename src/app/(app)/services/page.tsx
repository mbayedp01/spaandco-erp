import { getServices } from '@/lib/db/services'
import { Header } from '@/components/layout/header'
import { ServicesView } from './services-view'

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <>
      <Header title="Prestations" />
      <ServicesView services={services} />
    </>
  )
}
