import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RevenueChart, ServicesChart } from '@/components/dashboard/charts'
import { kpis, topServices } from '@/lib/mock-data'
import { getTodayAppointments } from '@/lib/db/appointments'
import { getStaff } from '@/lib/db/staff'
import { cn } from '@/lib/utils'
import { CalendarDays, Users, UserCheck } from 'lucide-react'

const PIE_COLORS = ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#CBD5E1']

const statusStyle: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-rose-50 text-rose-700',
}

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmé',
  pending: 'En attente',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

export default async function DashboardPage() {
  const [todayAppointments, staff] = await Promise.all([
    getTodayAppointments(),
    getStaff(),
  ])
  const activeStaff = staff.filter((s) => s.status === 'active').length

  return (
    <>
      <Header title="Tableau de bord" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* Métriques rapides */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { icon: CalendarDays, label: 'RDV confirmés', value: todayAppointments.filter((a) => a.status === 'confirmed').length, color: 'text-primary-600 bg-primary-50' },
            { icon: Users, label: 'Clients servis', value: new Set(todayAppointments.filter(a => a.status === 'completed').map(a => a.client_name)).size, color: 'text-emerald-600 bg-emerald-50' },
            { icon: UserCheck, label: 'Personnel actif', value: activeStaff, color: 'text-amber-600 bg-amber-50' },
          ].map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-xs">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', m.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">{m.label}</p>
                  <p className="text-lg font-bold text-slate-900">{m.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Chiffre d&apos;affaires vs Dépenses</h2>
              <span className="text-xs text-stone-400">6 derniers mois</span>
            </div>
            <RevenueChart />
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 font-semibold text-slate-900">Prestations populaires</h2>
            <ServicesChart />
            <div className="mt-4 space-y-2">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-stone-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {s.name}
                  </span>
                  <span className="font-medium text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rendez-vous du jour */}
        <div className="mt-6 rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Rendez-vous du jour</h2>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {todayAppointments.length} RDV
            </span>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-stone-400">
              Aucun rendez-vous aujourd&apos;hui
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className="w-14 font-medium text-slate-900">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{a.client_name}</p>
                    <p className="text-xs text-stone-400 truncate">{a.service_name} · {a.staff_name}</p>
                  </div>
                  <span className="hidden text-stone-500 sm:block">{a.duration} min</span>
                  <span className="hidden w-24 text-right font-medium text-slate-900 sm:block">
                    {(a.price ?? 0).toLocaleString('fr-FR')} F
                  </span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? 'bg-stone-100 text-stone-600')}>
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
