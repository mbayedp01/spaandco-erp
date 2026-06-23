import { getCampaigns } from '@/lib/db/campaigns'
import { MarketingView } from './marketing-view'

export default async function MarketingPage() {
  const campaigns = await getCampaigns()
  return <MarketingView campaigns={campaigns} />
}
