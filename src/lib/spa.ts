import { cookies } from 'next/headers'

export const SPA_IDS = {
  ALMADIES: '11111111-1111-1111-1111-111111111111',
  PLATEAU:  '22222222-2222-2222-2222-222222222222',
} as const

export function getCurrentSpaId(): string {
  const store = cookies()
  return store.get('selected_spa')?.value ?? SPA_IDS.ALMADIES
}
