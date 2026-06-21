import { Header } from '@/components/layout/header'
import { revenueByMonth, topServices, staffPerformance } from '@/lib/mock-data'
import { RevenueAreaChart, ServicesPieChart, StaffBarChart } from '@/components/reports/charts'
import { Download } from 'lucide-react'

const PIE_COLORS = ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#CBD5E1']

export default function ReportsPage() {
  const lastMonth = revenueByMonth[revenueByMonth.length - 1]
  const prevMonth = revenueByMonth[revenueByMonth.length - 2]
  const caGrowth = Math.round(((lastMonth.ca - prevMonth.ca) / prevMonth.ca) * 100)
  const profit = lastMonth.ca - lastMonth.depenses
  const margin = Math.round((profit / lastMonth.ca) * 100)

  return (
    <>
      <Header title="Rapports & Analyses" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Période + export */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Période analysée</p>
            <p className="font-semibold text-slate-900">Juillet 2025 – Juin 2026</p>
          </div>
          <button className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
            <Download className="h-4 w-4" />
            Exporter PDF
          </button>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'CA Juin 2026', value: `${lastMonth.ca.toLocaleString('fr-FR')} F`, sub: `+${caGrowth}% vs mai`, color: 'text-emerald-700' },
            { label: 'Bénéfice net', value: `${profit.toLocaleString('fr-FR')} F`, sub: `Marge ${margin}%`, color: 'text-primary-700' },
            { label: 'Total RDV ce mois', value: '124', sub: '+18 vs mai', color: 'text-slate-900' },
            { label: 'Taux occupation', value: '76%', sub: 'Capacité utilisée', color: 'text-slate-900' },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className={`mt-1 text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="mt-0.5 text-xs text-stone-400">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Graphique principal CA */}
        <div className="mb-6 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Chiffre d&apos;affaires vs Dépenses</h2>
              <p className="text-xs text-stone-400">12 derniers mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-primary-500 inline-block" />CA</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-400 inline-block" />Dépenses</span>
            </div>
          </div>
          <RevenueAreaChart />
        </div>

        {/* Prestations + Thérapeutes */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Pie prestations */}
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-2 font-semibold text-slate-900">Répartition des prestations</h2>
            <ServicesPieChart />
            <div className="mt-2 space-y-1.5">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-stone-600">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    {s.name}
                  </span>
                  <span className="font-medium text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar thérapeutes */}
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 font-semibold text-slate-900">Performance thérapeutes (mois)</h2>
            <StaffBarChart />
            <div className="mt-4 divide-y divide-stone-100">
              {staffPerformance.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-700">{t.ca.toLocaleString('fr-FR')} F</p>
                    <div className="flex items-center justify-end gap-1 text-xs text-stone-400">
                      <span>★ {t.note}</span>
                      <span>· {t.rdv} RDV</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau mensuel */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Synthèse mensuelle — 12 mois</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Mois</th>
                  <th className="px-5 py-3">Chiffre d&apos;affaires</th>
                  <th className="px-5 py-3">Dépenses</th>
                  <th className="px-5 py-3">Bénéfice</th>
                  <th className="px-5 py-3">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[...revenueByMonth].reverse().map((m) => {
                  const b = m.ca - m.depenses
                  const mg = Math.round((b / m.ca) * 100)
                  return (
                    <tr key={m.month} className="hover:bg-stone-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{m.month}</td>
                      <td className="px-5 py-3 text-emerald-700">{m.ca.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 text-rose-600">{m.depenses.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 font-semibold text-primary-700">{b.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${mg}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{mg}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
