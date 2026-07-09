import { getCampaigns } from '@/lib/db/campaigns'
import { Header } from '@/components/layout/header'
import { MarketingView } from './marketing-view'

export default async function MarketingPage() {
  const campaigns = await getCampaigns()
  return (
    <>
      <Header title="Marketing" />
      <MarketingView campaigns={campaigns} />
    </>
  )
}
