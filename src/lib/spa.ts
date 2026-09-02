import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export const SPA_IDS = {
  ALMADIES: '11111111-1111-1111-1111-111111111111',
  PLATEAU:  '22222222-2222-2222-2222-222222222222',
} as const

/**
 * Spa actif pour les requêtes de données.
 *
 * SaaS multi-établissement : un utilisateur avec un `spa_id` assigné
 * (caissier, comptable rattaché à un spa) est VERROUILLÉ sur son
 * établissement — le cookie `selected_spa` est ignoré pour lui.
 * Seul un admin (sans spa assigné) peut basculer via le cookie.
 */
export async function getCurrentSpaId(): Promise<string> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const assignedSpa = user?.user_metadata?.spa_id as string | undefined
  if (assignedSpa) return assignedSpa

  const store = cookies()
  return store.get('selected_spa')?.value ?? SPA_IDS.ALMADIES
}
