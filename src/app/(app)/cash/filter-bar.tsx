'use client'

import { useRouter } from 'next/navigation'
import { Filter, CalendarClock } from 'lucide-react'

const selectCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-stone-300 transition-colors'

interface Props {
  period: string
  type: string
  caissier: string
  caissiers: string[]
  lockToday?: boolean
}

export function CashFilterBar({ period, type, caissier, caissiers, lockToday = false }: Props) {
  const router = useRouter()

  function navigate(updates: Partial<Pick<Props, 'period' | 'type' | 'caissier'>>) {
    const merged = { period, type, caissier, ...updates }
    const params = new URLSearchParams()
    // Le caissier est verrouillé sur le jour : on n'émet pas period/caissier
    if (!lockToday && merged.period !== 'all')   params.set('period',   merged.period)
    if (merged.type !== 'all')                   params.set('type',     merged.type)
    if (!lockToday && merged.caissier !== 'all') params.set('caissier', merged.caissier)
    const qs = params.toString()
    router.push(`/cash${qs ? '?' + qs : ''}`)
  }

  const typeSelect = (
    <select
      value={type}
      onChange={(e) => navigate({ type: e.target.value })}
      className={selectCls}
    >
      <option value="all">Recettes &amp; Charges</option>
      <option value="recette">Recettes uniquement</option>
      <option value="charge">Charges uniquement</option>
    </select>
  )

  // Vue caissier : uniquement la caisse du jour
  if (lockToday) {
    return (
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
          <CalendarClock className="h-3.5 w-3.5" />
          Aujourd&apos;hui
        </span>
        {typeSelect}
      </div>
    )
  }

  const hasFilters = period !== 'all' || type !== 'all' || caissier !== 'all'

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-stone-400" />

      <select
        value={period}
        onChange={(e) => navigate({ period: e.target.value })}
        className={selectCls}
      >
        <option value="all">Toutes les dates</option>
        <option value="today">Aujourd&apos;hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
      </select>

      {typeSelect}

      {caissiers.length > 0 && (
        <select
          value={caissier}
          onChange={(e) => navigate({ caissier: e.target.value })}
          className={selectCls}
        >
          <option value="all">Tous les caissiers</option>
          {caissiers.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={() => navigate({ period: 'all', type: 'all', caissier: 'all' })}
          className="text-xs text-stone-400 underline hover:text-rose-500 cursor-pointer"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
