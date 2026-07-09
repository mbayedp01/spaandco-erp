'use client'

import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'

const selectCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-stone-300 transition-colors'

interface Props {
  period: string
  type: string
  caissier: string
  caissiers: string[]
}

export function CashFilterBar({ period, type, caissier, caissiers }: Props) {
  const router = useRouter()

  function navigate(updates: Partial<Pick<Props, 'period' | 'type' | 'caissier'>>) {
    const merged = { period, type, caissier, ...updates }
    const params = new URLSearchParams()
    if (merged.period !== 'all')   params.set('period',   merged.period)
    if (merged.type !== 'all')     params.set('type',     merged.type)
    if (merged.caissier !== 'all') params.set('caissier', merged.caissier)
    const qs = params.toString()
    router.push(`/cash${qs ? '?' + qs : ''}`)
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

      <select
        value={type}
        onChange={(e) => navigate({ type: e.target.value })}
        className={selectCls}
      >
        <option value="all">Recettes &amp; Charges</option>
        <option value="recette">Recettes uniquement</option>
        <option value="charge">Charges uniquement</option>
      </select>

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
