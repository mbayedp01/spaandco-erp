'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { switchSpa } from '@/app/actions/spa'
import { useRouter } from 'next/navigation'

// Couleurs fixes pour distinguer les spas dans le dropdown (pas la couleur active)
const SPA_DOT: Record<string, string> = {
  Almadies: 'bg-teal-500',
  Plateau:  'bg-violet-500',
  Saly:     'bg-amber-500',
}

type Establishment = { id: string; name: string; city: string }

export function SpaSwitcher({
  establishments,
  currentSpaId,
}: {
  establishments: Establishment[]
  currentSpaId: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const current = establishments.find(e => e.id === currentSpaId) ?? establishments[0]

  async function handleSwitch(spaId: string) {
    if (spaId === currentSpaId) { setOpen(false); return }
    setPending(true)
    await switchSpa(spaId)
    setOpen(false)
    setPending(false)
    router.refresh()
  }

  if (!establishments.length) return null

  return (
    <div className="relative px-3 pb-3">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={pending}
        className="flex w-full items-center gap-2.5 rounded-md bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10 disabled:opacity-60"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white bg-primary-600">
          {current?.name[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-xs font-semibold text-white">{current?.name ?? '—'}</p>
          <p className="text-[10px] text-stone-500">{current?.city ?? ''}</p>
        </div>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-stone-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-md border border-white/10 bg-[#1e1c32] py-1 shadow-2xl">
            <p className="px-3 pb-1 pt-1.5 text-[9px] font-semibold uppercase tracking-widest text-stone-600">
              Établissement
            </p>
            {establishments.map(spa => {
              const dot = SPA_DOT[spa.name] ?? 'bg-primary-500'
              const isActive = spa.id === currentSpaId
              return (
                <button
                  key={spa.id}
                  onClick={() => handleSwitch(spa.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 transition-colors hover:bg-white/8',
                    isActive && 'bg-white/5'
                  )}
                >
                  <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white', dot)}>
                    {spa.name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={cn('text-xs font-medium', isActive ? 'text-white' : 'text-stone-300')}>{spa.name}</p>
                    <p className="text-[10px] text-stone-500">{spa.city}</p>
                  </div>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary-400" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
