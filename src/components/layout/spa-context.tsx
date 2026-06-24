'use client'

import { createContext, useContext } from 'react'
import type { UserRole } from '@/lib/roles'

type Establishment = { id: string; name: string; city: string }

interface SpaContextValue {
  establishments: Establishment[]
  currentSpaId: string
  userRole: UserRole
}

const SpaContext = createContext<SpaContextValue>({
  establishments: [],
  currentSpaId: '',
  userRole: 'admin',
})

export function SpaProvider({
  establishments,
  currentSpaId,
  userRole,
  children,
}: SpaContextValue & { children: React.ReactNode }) {
  return (
    <SpaContext.Provider value={{ establishments, currentSpaId, userRole }}>
      {children}
    </SpaContext.Provider>
  )
}

export function useSpa() {
  return useContext(SpaContext)
}
