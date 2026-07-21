import { Header } from '@/components/layout/header'
import { expenseCategories } from '@/lib/mock-data'
import { getCashTransactions } from '@/lib/db/cash'
import { getCurrentSpaId } from '@/lib/spa'
import { createServerClient } from '@/lib/supabase/server'
import { ComptaBarChart, ExpensePieChart } from '@/components/reports/charts'
import { ExportButton } from './export-button'
import { AccountingFilterBar } from './filter-bar'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

const MONTHS_FR      = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc']
const MONTHS_FULL_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

type Tx = { date: string; type: string; amount: number }

function buildMonthlyData(txs: Tx[]) {
  const monthMap = new Map<string, { ca: number; depenses: number }>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, { ca: 0, depenses: 0 })
  }
  for (const t of txs) {
    const key   = t.date.substring(0, 7)
    const entry = monthMap.get(key)
    if (entry) {
      if (t.type === 'recette') entry.ca += t.amount
      else entry.depenses += t.amount
    }
  }
  return Array.from(monthMap.entries()).map(([key, val]) => {
    const [yr, mo] = key.split('-')
    return { month: `${MONTHS_FR[parseInt(mo) - 1]} ${yr}`, monthKey: key, ...val }
  })
}

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const spaId  = getCurrentSpaId()
  const supabase = createServerClient()
  const params = await searchParams

  const selectedYear  = params.year  || ''
  const selectedMonth = params.month || ''

  const [transactions, spaResult] = await Promise.all([
    getCashTransactions(spaId),
    supabase.from('establishments').select('name').eq('id', spaId).single(),
  ])
  const spaName = (spaResult.data as { name?: string } | null)?.name ?? 'Spa'

  // Filter transactions for KPIs and export
  const filtered = transactions.filter(t => {
    const [y, m] = t.date.split('-')
    if (selectedYear  && y !== selectedYear)                       return false
    if (selectedMonth && m !== selectedMonth.padStart(2, '0'))     return false
    return true
  })

  // KPIs from filtered data
  const totalCA  = filtered.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
  const totalDep = filtered.filter(t => t.type === 'charge').reduce((s, t) => s + t.amount, 0)
  const profit   = totalCA - totalDep
  const marge    = totalCA > 0 ? Math.round((profit / totalCA) * 100) : 0

  // Monthly data (12 months) for table + export
  const monthlyData = buildMonthlyData(transactions)
  const lastIdx     = monthlyData.length - 1
  const lastMonth   = monthlyData[lastIdx]
  const prevMonth   = monthlyData[lastIdx - 1]

  const caGrowth     = prevMonth?.ca > 0 ? Math.round(((lastMonth.ca - prevMonth.ca) / prevMonth.ca) * 100) : 0
  const profitGrowth = (prevMonth?.ca - prevMonth?.depenses) > 0
    ? Math.round(((lastMonth.ca - lastMonth.depenses - (prevMonth.ca - prevMonth.depenses)) / (prevMonth.ca - prevMonth.depenses)) * 100)
    : 0

  // Period label
  const periodLabel = selectedMonth && selectedYear
    ? `${MONTHS_FULL_FR[parseInt(selectedMonth) - 1]} ${selectedYear}`
    : selectedYear
    ? `Année ${selectedYear}`
    : selectedMonth
    ? MONTHS_FULL_FR[parseInt(selectedMonth) - 1]
    : 'Toute la période'

  const totalMonthCA  = monthlyData.reduce((s, m) => s + m.ca, 0)
  const totalMonthDep = monthlyData.reduce((s, m) => s + m.depenses, 0)

  const exportTx = filtered.map(t => ({ date: t.date, label: t.label ?? '', type: t.type, amount: t.amount }))

  return (
    <>
      <Header title="Comptabilité" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Filtre */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-stone-400">Période sélectionnée</p>
            <p className="font-semibold text-slate-900">{periodLabel}</p>
          </div>
          <AccountingFilterBar year={selectedYear} month={selectedMonth} />
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Chiffre d&apos;affaires</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{totalCA.toLocaleString('fr-FR')} F</p>
            {!selectedMonth && !selectedYear && (
              <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', caGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {caGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {caGrowth >= 0 ? '+' : ''}{caGrowth}% vs mois préc.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Dépenses</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{totalDep.toLocaleString('fr-FR')} F</p>
            <p className="mt-1 text-xs text-stone-400">{periodLabel}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Bénéfice net</p>
            <p className="mt-1 text-2xl font-bold text-primary-700">{profit.toLocaleString('fr-FR')} F</p>
            {!selectedMonth && !selectedYear && (
              <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', profitGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {profitGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {profitGrowth >= 0 ? '+' : ''}{profitGrowth}% vs mois préc.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Marge nette</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{marge}%</p>
            <p className="mt-1 text-xs text-stone-400">CA 12 mois : {(totalMonthCA / 1000000).toFixed(1)}M F</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">CA vs Dépenses — 12 mois</h2>
              <ExportButton
                spaName={spaName}
                monthlyData={monthlyData}
                transactions={exportTx}
                period={periodLabel}
              />
            </div>
            <ComptaBarChart />
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-1 font-semibold text-slate-900">Répartition dépenses</h2>
            <ExpensePieChart />
            <div className="mt-2 space-y-1.5">
              {expenseCategories.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: e.color }} />
                    <span className="text-stone-600">{e.name}</span>
                  </span>
                  <span className="font-medium text-slate-900">{e.amount.toLocaleString('fr-FR')} F</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Synthèse mensuelle — données réelles */}
        <div className="mb-6 rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Synthèse mensuelle</h2>
            <div className="flex gap-4 text-xs text-stone-500">
              <span>CA total : <strong className="text-emerald-700">{(totalMonthCA / 1000000).toFixed(2)}M F</strong></span>
              <span>Dép. totales : <strong className="text-rose-600">{(totalMonthDep / 1000000).toFixed(2)}M F</strong></span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Mois</th>
                  <th className="px-5 py-3">CA</th>
                  <th className="px-5 py-3">Dépenses</th>
                  <th className="px-5 py-3">Bénéfice</th>
                  <th className="px-5 py-3">Marge</th>
                  <th className="hidden px-5 py-3 sm:table-cell">Évolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {monthlyData.map((m, i) => {
                  const b   = m.ca - m.depenses
                  const mg  = m.ca > 0 ? Math.round((b / m.ca) * 100) : 0
                  const prev = monthlyData[i - 1]
                  const evo  = prev && prev.ca > 0 ? Math.round(((m.ca - prev.ca) / prev.ca) * 100) : null
                  const isSelected = selectedMonth && selectedYear
                    ? m.monthKey === `${selectedYear}-${selectedMonth.padStart(2, '0')}`
                    : false
                  return (
                    <tr key={m.monthKey} className={cn('hover:bg-stone-50', isSelected && 'bg-primary-50')}>
                      <td className="px-5 py-3 font-medium text-slate-900">{m.month}</td>
                      <td className="px-5 py-3 text-emerald-700">{m.ca.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 text-rose-600">{m.depenses.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 font-semibold text-primary-700">{b.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', mg >= 40 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                          {mg}%
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        {evo !== null ? (
                          <span className={cn('flex items-center gap-1 text-xs font-medium', evo >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                            {evo >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {evo >= 0 ? '+' : ''}{evo}%
                          </span>
                        ) : <span className="text-xs text-stone-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Écritures filtrées */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Écritures — {periodLabel}</h2>
            <span className="text-xs text-stone-400">{filtered.length} lignes</span>
          </div>
          <div className="divide-y divide-stone-100">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-stone-50">
                <span className="w-14 shrink-0 text-xs text-stone-400">{t.date}</span>
                <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', t.type === 'recette' ? 'bg-emerald-500' : 'bg-rose-400')} />
                <span className="flex-1 text-slate-700">{t.label}</span>
                <span className={cn('font-semibold tabular-nums', t.type === 'recette' ? 'text-emerald-700' : 'text-rose-600')}>
                  {t.type === 'recette' ? '+' : '−'}{t.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-stone-400">
                Aucune écriture pour cette période.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
