import { getClients } from '@/lib/db/clients'
import { Header } from '@/components/layout/header'
import { ClientsView } from './clients-view'

export default async function ClientsPage() {
  const clients = await getClients()
  return (
    <>
      <Header title="Clients" />
      <ClientsView clients={clients} />
    </>
  )
}
