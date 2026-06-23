import { getClients } from '@/lib/db/clients'
import { ClientsView } from './clients-view'

export default async function ClientsPage() {
  const clients = await getClients()
  return <ClientsView clients={clients} />
}
