'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const selectCls = 'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-primary-400 focus:outline-none cursor-pointer'

export function AccountingFilterBar({ year, month }: { year: string; month: string }) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.push(`${pathname}?${p.toString()}`)
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={month} onChange={e => update('month', e.target.value)} className={selectCls}>
        <option value="">Tous les mois</option>
        {MONTHS_FR.map((name, i) => (
          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{name}</option>
        ))}
      </select>
      <select value={year} onChange={e => update('year', e.target.value)} className={selectCls}>
        <option value="">Toutes les années</option>
        {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
      </select>
      {(month || year) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
