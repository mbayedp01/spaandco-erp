'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Filter, CalendarClock } from 'lucide-react'

const selectCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-stone-300 transition-colors'

const inputCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 hover:border-stone-300 transition-colors'

interface Props {
  period: string
  type: string
  caissier: string
  caissiers: string[]
  lockToday?: boolean
  dateFrom?: string
  dateTo?: string
}

export function CashFilterBar({ period, type, caissier, caissiers, lockToday = false, dateFrom, dateTo }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localFrom, setLocalFrom] = useState(dateFrom ?? '')
  const [localTo, setLocalTo]     = useState(dateTo ?? '')

  function navigate(updates: Record<string, string>) {
    const merged: Record<string, string> = { period, type, caissier, ...updates }
    const params = new URLSearchParams()
    if (!lockToday && merged.period !== 'all') params.set('period', merged.period)
    if (merged.type !== 'all')                 params.set('type',   merged.type)
    if (!lockToday && merged.caissier !== 'all') params.set('caissier', merged.caissier)
    if (merged.period === 'custom') {
      if (merged.from) params.set('from', merged.from)
      if (merged.to)   params.set('to',   merged.to)
    }
    const qs = params.toString()
    router.push(`/cash${qs ? '?' + qs : ''}`)
  }

  function handlePeriodChange(val: string) {
    if (val === 'custom') {
      const today = new Date().toISOString().split('T')[0]
      setLocalFrom(today)
      setLocalTo(today)
      navigate({ period: 'custom', from: today, to: today })
    } else {
      setLocalFrom('')
      setLocalTo('')
      navigate({ period: val })
    }
  }

  function applyDateRange() {
    if (localFrom) {
      navigate({ period: 'custom', from: localFrom, to: localTo || localFrom })
    }
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

  const periodValue = period === 'custom' ? 'custom' : period
  const showDateInputs = periodValue === 'custom'
  const hasFilters = period !== 'all' || type !== 'all' || caissier !== 'all'

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-stone-400" />

      <select
        value={periodValue}
        onChange={(e) => handlePeriodChange(e.target.value)}
        className={selectCls}
      >
        <option value="all">Toutes les dates</option>
        <option value="today">Aujourd&apos;hui</option>
        <option value="yesterday">Hier</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
        <option value="custom">Dates précises…</option>
      </select>

      {showDateInputs && (
        <>
          <input
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className={inputCls}
          />
          <span className="text-xs text-stone-400">→</span>
          <input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={applyDateRange}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 cursor-pointer"
          >
            Appliquer
          </button>
        </>
      )}

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
          onClick={() => {
            setLocalFrom('')
            setLocalTo('')
            navigate({ period: 'all', type: 'all', caissier: 'all' })
          }}
          className="text-xs text-stone-400 underline hover:text-rose-500 cursor-pointer"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
