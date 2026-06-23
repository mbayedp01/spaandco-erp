import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type MembershipPlan = Database['public']['Tables']['membership_plans']['Row']
type Membership = Database['public']['Tables']['memberships']['Row']

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .order('price')
  if (error) console.error('getMembershipPlans:', error.message)
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
