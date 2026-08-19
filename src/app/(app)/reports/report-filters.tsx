'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Filter, Building2 } from 'lucide-react'

const selectCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer hover:border-stone-300 transition-colors'

const inputCls =
  'rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 hover:border-stone-300 transition-colors'

interface Props {
  selectedSpa: string
  dateFrom: string
  dateTo: string
  reportType: string
  establishments: { id: string; name: string }[]
  isAdmin: boolean
}

export function ReportFilters({ selectedSpa, dateFrom, dateTo, reportType, establishments, isAdmin }: Props) {
  const router = useRouter()
  const [from, setFrom] = useState(dateFrom)
  const [to, setTo] = useState(dateTo)

  function navigate(updates: Record<string, string>) {
    const merged: Record<string, string> = {
      spa: selectedSpa,
      from: from,
      to: to,
      report: reportType,
      ...updates,
    }
    const params = new URLSearchParams()
    if (merged.spa !== 'all') params.set('spa', merged.spa)
    if (merged.from) params.set('from', merged.from)
    if (merged.to) params.set('to', merged.to)
    if (merged.report !== 'general') params.set('report', merged.report)
    const qs = params.toString()
    router.push(`/reports${qs ? '?' + qs : ''}`)
  }

  function applyDates() {
    navigate({ from, to })
  }

  function setPreset(preset: string) {
    const now = new Date()
    let f: string, t: string
    if (preset === 'today') {
      f = t = now.toISOString().split('T')[0]
    } else if (preset === 'yesterday') {
      const d = new Date(now); d.setDate(d.getDate() - 1)
      f = t = d.toISOString().split('T')[0]
    } else if (preset === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 7)
      f = d.toISOString().split('T')[0]
      t = now.toISOString().split('T')[0]
    } else if (preset === 'month') {
      f = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      t = now.toISOString().split('T')[0]
    } else if (preset === 'last-month') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      f = prev.toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      t = lastDay.toISOString().split('T')[0]
    } else if (preset === 'quarter') {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      f = qStart.toISOString().split('T')[0]
      t = now.toISOString().split('T')[0]
    } else if (preset === 'year') {
      f = `${now.getFullYear()}-01-01`
      t = now.toISOString().split('T')[0]
    } else {
      return
    }
    setFrom(f)
    setTo(t)
    navigate({ from: f, to: t })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-stone-400" />

      {/* Sélecteur spa */}
      {(isAdmin || establishments.length > 1) && (
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-stone-400" />
          <select
            value={selectedSpa}
            onChange={(e) => navigate({ spa: e.target.value })}
            className={selectCls}
          >
            <option value="all">Tous les spas</option>
            {establishments.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Presets période */}
      <select
        defaultValue=""
        onChange={(e) => { if (e.target.value) setPreset(e.target.value); e.target.value = '' }}
        className={selectCls}
      >
        <option value="" disabled>Période rapide…</option>
        <option value="today">Aujourd&apos;hui</option>
        <option value="yesterday">Hier</option>
        <option value="week">7 derniers jours</option>
        <option value="month">Ce mois</option>
        <option value="last-month">Mois dernier</option>
        <option value="quarter">Ce trimestre</option>
        <option value="year">Cette année</option>
      </select>

      {/* Dates personnalisées */}
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className={inputCls}
      />
      <span className="text-xs text-stone-400">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className={inputCls}
      />
      <button
        type="button"
        onClick={applyDates}
        className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 cursor-pointer"
      >
        Appliquer
      </button>

      {/* Type de rapport */}
      <select
        value={reportType}
        onChange={(e) => navigate({ report: e.target.value })}
        className={selectCls}
      >
        <option value="general">Rapport général</option>
        <option value="financier">Rapport financier</option>
        <option value="prestations">Rapport prestations</option>
        <option value="praticiens">Rapport praticiens</option>
      </select>
    </div>
  )
}
