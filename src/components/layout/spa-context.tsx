'use client'

import { createContext, useContext } from 'react'

type Establishment = { id: string; name: string; city: string }

interface SpaContextValue {
  establishments: Establishment[]
  currentSpaId: string
}

const SpaContext = createContext<SpaContextValue>({ establishments: [], currentSpaId: '' })

export function SpaProvider({
  establishments,
  currentSpaId,
  children,
}: SpaContextValue & { children: React.ReactNode }) {
  return (
    <SpaContext.Provider value={{ establishments, currentSpaId }}>
      {children}
    </SpaContext.Provider>
  )
}

export function useSpa() {
  return useContext(SpaContext)
}
