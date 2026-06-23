import { getServices } from '@/lib/db/services'
import { ServicesView } from './services-view'

export default async function ServicesPage() {
  const services = await getServices()
  return <ServicesView services={services} />
}
