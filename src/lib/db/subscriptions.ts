import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type MembershipPlan = Database['public']['Tables']['membership_plans']['Row']
export type Membership = Database['public']['Tables']['memberships']['Row']

export async function getMembershipPlans(spaId?: string | null): Promise<MembershipPlan[]> {
  const supabase = createServerClient()
  let q = (supabase.from('membership_plans') as any).select('*').order('price')
  if (spaId) q = q.eq('spa_id', spaId)
  const { data, error } = await q
  if (error) {
    console.error('getMembershipPlans:', error.message)
    if (spaId && error.message.includes('spa_id')) {
      const { data: fallback } = await supabase.from('membership_plans').select('*').order('price')
      return (fallback as MembershipPlan[] | null) ?? []
    }
  }
  return (data as MembershipPlan[] | null) ?? []
}

export async function getMemberships(): Promise<Membership[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('getMemberships:', error.message)
  return (data as Membership[] | null) ?? []
}
