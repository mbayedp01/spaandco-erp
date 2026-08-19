import { Header } from '@/components/layout/header'
import { getReportData } from '@/lib/db/reports'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole } from '@/lib/user-role'
import { RevenueAreaChart, ServicesPieChart, StaffBarChart, PaymentMethodChart } from '@/components/reports/charts'
import { ExportReportPDFButton } from './pdf-button'
import { ReportFilters } from './report-filters'
import { TrendingUp, TrendingDown, Wallet, Receipt, BarChart3, Users } from 'lucide-react'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const role = await getCurrentUserRole()
  const defaultSpaId = getCurrentSpaId()
  const establishments = await getEstablishments()

  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const defaultTo = now.toISOString().split('T')[0]

  const selectedSpa = params.spa ?? (defaultSpaId || 'all')
  const dateFrom = params.from ?? defaultFrom
  const dateTo = params.to ?? defaultTo
  const reportType = params.report ?? 'general'

  const spaId = selectedSpa === 'all' ? null : selectedSpa
  const report = await getReportData(spaId, dateFrom, dateTo)

  const spaName = selectedSpa === 'all'
    ? 'Tous les spas'
    : establishments.find(e => e.id === selectedSpa)?.name ?? 'Spa and Co'

  const fromLabel = new Date(dateFrom + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const toLabel = new Date(dateTo + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const periodLabel = dateFrom === dateTo ? fromLabel : `${fromLabel} — ${toLabel}`

  return (
    <>
      <Header title="Rapports & Analyses" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {/* Filtres */}
        <div className="mb-6">
          <ReportFilters
            selectedSpa={selectedSpa}
            dateFrom={dateFrom}
            dateTo={dateTo}
            reportType={reportType}
            establishments={establishments.map(e => ({ id: e.id, name: e.name }))}
            isAdmin={role === 'admin'}
          />
        </div>

        {/* Période + export */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-stone-500">{spaName}</p>
            <p className="font-semibold text-slate-900">{periodLabel}</p>
          </div>
          <ExportReportPDFButton
            spaName={spaName}
            period={periodLabel}
            lastMonthCA={report.totalRevenue}
            profit={report.profit}
            margin={report.margin}
            caGrowth={0}
            topServices={report.topServices}
            staffPerformance={report.topPerformers.map(p => ({
              name: p.name, role: 'Praticien', ca: p.ca, note: 0, rdv: p.count,
            }))}
            monthlyData={report.monthlyData}
          />
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Chiffre d\'affaires', value: `${report.totalRevenue.toLocaleString('fr-FR')} F`, icon: TrendingUp, color: 'text-emerald-700', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Dépenses', value: `${report.totalExpenses.toLocaleString('fr-FR')} F`, icon: TrendingDown, color: 'text-rose-700', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
            { label: 'Bénéfice net', value: `${report.profit.toLocaleString('fr-FR')} F`, icon: Wallet, color: 'text-primary-700', iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
            { label: 'Marge', value: `${report.margin}%`, icon: BarChart3, color: 'text-slate-900', iconBg: 'bg-stone-50', iconColor: 'text-stone-600' },
            { label: 'Nb prestations', value: String(report.txCount), icon: Receipt, color: 'text-slate-900', iconBg: 'bg-stone-50', iconColor: 'text-stone-600' },
            { label: 'Ticket moyen', value: `${report.avgTicket.toLocaleString('fr-FR')} F`, icon: Users, color: 'text-slate-900', iconBg: 'bg-stone-50', iconColor: 'text-stone-600' },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${k.iconBg}`}>
                <k.icon className={`h-4 w-4 ${k.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-stone-500">{k.label}</p>
                <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Graphique CA vs Dépenses */}
        {(reportType === 'general' || reportType === 'financier') && report.monthlyData.length > 0 && (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Chiffre d&apos;affaires vs Dépenses</h2>
                <p className="text-xs text-stone-400">Évolution sur la période</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-primary-500" />CA</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-amber-400" />Dépenses</span>
              </div>
            </div>
            <RevenueAreaChart data={report.monthlyData} />
          </div>
        )}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Répartition prestations */}
          {(reportType === 'general' || reportType === 'prestations') && report.topServices.length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <h2 className="mb-2 font-semibold text-slate-900">Répartition du CA par catégorie</h2>
              <ServicesPieChart data={report.topServices} />
              <div className="mt-2 space-y-1.5">
                {report.topServices.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">{s.name}</span>
                    <span className="font-medium text-slate-900">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modes de paiement */}
          {(reportType === 'general' || reportType === 'financier') && report.paymentMethods.length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <h2 className="mb-2 font-semibold text-slate-900">Répartition par mode de paiement</h2>
              <PaymentMethodChart data={report.paymentMethods} />
              <div className="mt-2 space-y-1.5">
                {report.paymentMethods.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">{m.name}</span>
                    <span className="font-medium text-slate-900">{m.value.toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performance praticiens */}
        {(reportType === 'general' || reportType === 'praticiens') && report.topPerformers.length > 0 && (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 font-semibold text-slate-900">Performance des praticiens</h2>
            <StaffBarChart data={report.topPerformers} />
            <div className="mt-4 divide-y divide-stone-100">
              {report.topPerformers.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-2.5 text-sm">
                  <p className="font-medium text-slate-900">{t.name}</p>
                  <div className="text-right">
                    <p className="font-semibold text-primary-700">{t.ca.toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-stone-400">{t.count} prestations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tableau journalier */}
        {report.dailyData.length > 0 && (
          <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Détail journalier</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">CA</th>
                    <th className="px-5 py-3">Dépenses</th>
                    <th className="px-5 py-3">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[...report.dailyData].reverse().map((d) => {
                    const solde = d.ca - d.depenses
                    return (
                      <tr key={d.date} className="hover:bg-stone-50">
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {new Date(d.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-5 py-3 text-emerald-700">{d.ca.toLocaleString('fr-FR')} F</td>
                        <td className="px-5 py-3 text-rose-600">{d.depenses.toLocaleString('fr-FR')} F</td>
                        <td className={`px-5 py-3 font-semibold ${solde >= 0 ? 'text-primary-700' : 'text-rose-700'}`}>
                          {solde.toLocaleString('fr-FR')} F
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-200 bg-stone-50 font-semibold">
                    <td className="px-5 py-3 text-slate-900">Total</td>
                    <td className="px-5 py-3 text-emerald-700">{report.totalRevenue.toLocaleString('fr-FR')} F</td>
                    <td className="px-5 py-3 text-rose-600">{report.totalExpenses.toLocaleString('fr-FR')} F</td>
                    <td className={`px-5 py-3 ${report.profit >= 0 ? 'text-primary-700' : 'text-rose-700'}`}>
                      {report.profit.toLocaleString('fr-FR')} F
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {report.txCount === 0 && (
          <div className="rounded-lg border border-stone-200 bg-white p-12 text-center shadow-xs">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="text-sm text-stone-500">Aucune donnée pour cette période et ce spa.</p>
            <p className="mt-1 text-xs text-stone-400">Ajustez les filtres pour voir les rapports.</p>
          </div>
        )}
      </div>
    </>
  )
}
