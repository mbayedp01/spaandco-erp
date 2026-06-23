import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Campaign = Database['public']['Tables']['campaigns']['Row']

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getCampaigns:', error.message)
  return (data as Campaign[] | null) ?? []
}
