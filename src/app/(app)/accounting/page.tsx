import { Header } from '@/components/layout/header'
import { revenueByMonth, expenseCategories } from '@/lib/mock-data'
import { getCashTransactions } from '@/lib/db/cash'
import { getCurrentSpaId } from '@/lib/spa'
import { ComptaBarChart, ExpensePieChart } from '@/components/reports/charts'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'

export default async function AccountingPage() {
  const spaId = getCurrentSpaId()
  const transactions = await getCashTransactions(spaId)
  const lastMonth = revenueByMonth[revenueByMonth.length - 1]
  const prevMonth = revenueByMonth[revenueByMonth.length - 2]
  const profit = lastMonth.ca - lastMonth.depenses
  const prevProfit = prevMonth.ca - prevMonth.depenses
  const caGrowth = Math.round(((lastMonth.ca - prevMonth.ca) / prevMonth.ca) * 100)
  const profitGrowth = Math.round(((profit - prevProfit) / prevProfit) * 100)
  const marge = Math.round((profit / lastMonth.ca) * 100)

  const totalCA = revenueByMonth.reduce((s, m) => s + m.ca, 0)
  const totalDep = revenueByMonth.reduce((s, m) => s + m.depenses, 0)

  return (
    <>
      <Header title="Comptabilité" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">CA ce mois</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{lastMonth.ca.toLocaleString('fr-FR')} F</p>
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', caGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {caGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {caGrowth >= 0 ? '+' : ''}{caGrowth}% vs mois préc.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Dépenses ce mois</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{lastMonth.depenses.toLocaleString('fr-FR')} F</p>
            <p className="mt-1 text-xs text-stone-400">Juin 2026</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Bénéfice net</p>
            <p className="mt-1 text-2xl font-bold text-primary-700">{profit.toLocaleString('fr-FR')} F</p>
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', profitGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {profitGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {profitGrowth >= 0 ? '+' : ''}{profitGrowth}% vs mois préc.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Marge nette</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{marge}%</p>
            <p className="mt-1 text-xs text-stone-400">CA annuel : {(totalCA / 1000000).toFixed(1)}M F</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">CA vs Dépenses — 12 mois</h2>
              <button className="flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
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

        {/* Synthèse mensuelle */}
        <div className="mb-6 rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Synthèse mensuelle</h2>
            <div className="flex gap-4 text-xs text-stone-500">
              <span>CA total : <strong className="text-emerald-700">{(totalCA / 1000000).toFixed(2)}M F</strong></span>
              <span>Dép. totales : <strong className="text-rose-600">{(totalDep / 1000000).toFixed(2)}M F</strong></span>
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
                {revenueByMonth.map((m, i) => {
                  const b = m.ca - m.depenses
                  const mg = Math.round((b / m.ca) * 100)
                  const prev = revenueByMonth[i - 1]
                  const evo = prev ? Math.round(((m.ca - prev.ca) / prev.ca) * 100) : null
                  return (
                    <tr key={m.month} className="hover:bg-stone-50">
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

        {/* Écritures récentes */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Écritures récentes</h2>
            <span className="text-xs text-stone-400">{transactions.length} lignes</span>
          </div>
          <div className="divide-y divide-stone-100">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-stone-50">
                <span className="w-14 shrink-0 text-xs text-stone-400">{t.date}</span>
                <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', t.type === 'recette' ? 'bg-emerald-500' : 'bg-rose-400')} />
                <span className="flex-1 text-slate-700">{t.label}</span>
                <span className={cn('font-semibold tabular-nums', t.type === 'recette' ? 'text-emerald-700' : 'text-rose-600')}>
                  {t.type === 'recette' ? '+' : '−'}{t.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
