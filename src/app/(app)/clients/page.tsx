import { getClients } from '@/lib/db/clients'
import { getCurrentSpaId } from '@/lib/spa'
import { Header } from '@/components/layout/header'
import { ClientsView } from './clients-view'

export default async function ClientsPage() {
  const spaId = getCurrentSpaId()
  const clients = await getClients(spaId)
  return (
    <>
      <Header title="Clients" />
      <ClientsView clients={clients} />
    </>
  )
}
