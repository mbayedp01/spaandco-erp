import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RevenueChart, ServicesChart } from '@/components/dashboard/charts'
import { getDashboardStats } from '@/lib/db/dashboard'
import { getTodayAppointments } from '@/lib/db/appointments'
import { getRecentAuditLogs } from '@/lib/db/audit'
import { getStaff } from '@/lib/db/staff'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole, getCurrentUserName } from '@/lib/user-role'
import { cn } from '@/lib/utils'
import {
  CalendarDays, Users, UserCheck, TrendingUp, TrendingDown,
  Package, CreditCard, Activity, AlertTriangle,
} from 'lucide-react'

const PIE_COLORS = ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#CBD5E1']

const statusStyle: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending:   'bg-amber-50 text-amber-700',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-rose-50 text-rose-700',
}
const statusLabel: Record<string, string> = {
  confirmed: 'Confirmé',
  pending:   'En attente',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

const ACTION_ICONS: Record<string, string> = {
  created: '✦',
  updated: '✎',
  deleted: '✕',
}
const ENTITY_LABELS: Record<string, string> = {
  client: 'Client', appointment: 'Rendez-vous', service: 'Prestation',
  cash: 'Caisse', inventory: 'Stock', supplier: 'Fournisseur',
  plan: 'Abonnement', user: 'Utilisateur', staff: 'Personnel',
}

function formatDelta(current: number, previous: number): { delta: string; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) return { delta: current > 0 ? '+100%' : '—', trend: current > 0 ? 'up' : 'neutral' }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { delta: `${pct >= 0 ? '+' : ''}${pct}%`, trend: pct >= 0 ? 'up' : 'down' }
}

export default async function DashboardPage() {
  const spaId = getCurrentSpaId()
  const [userRole, userName, stats, allAppointments, staff, recentLogs] = await Promise.all([
    getCurrentUserRole(),
    getCurrentUserName(),
    getDashboardStats(spaId),
    getTodayAppointments(spaId),
    getStaff(spaId),
    getRecentAuditLogs(8, spaId),
  ])

  const isMedecin  = userRole === 'medecin'
  const activeStaff = staff.filter(s => s.status === 'active').length

  const todayAppointments = isMedecin && userName
    ? allAppointments.filter(a => a.staff_name === userName)
    : allAppointments

  const caGrowth = formatDelta(stats.revenueMonth, stats.prevMonthRevenue)

  const kpis = isMedecin ? [
    { label: 'Mes soins confirmés', value: String(stats.confirmedToday), delta: `${stats.totalAppointmentsToday} total`, trend: 'neutral' as const, sub: 'Aujourd\'hui' },
    { label: 'Clients servis', value: String(stats.completedToday), delta: `${stats.cancelledToday} annulés`, trend: 'neutral' as const, sub: 'Aujourd\'hui' },
    { label: 'Nouveaux clients', value: String(stats.newClientsThisMonth), delta: '', trend: 'neutral' as const, sub: 'Ce mois' },
  ] : [
    { label: 'CA du mois', value: `${stats.revenueMonth.toLocaleString('fr-FR')} F`, ...caGrowth, sub: 'vs mois précédent' },
    { label: 'Rendez-vous du jour', value: String(stats.totalAppointmentsToday), delta: `${stats.confirmedToday} confirmés`, trend: 'neutral' as const },
    { label: 'Nouveaux clients', value: String(stats.newClientsThisMonth), delta: `${stats.totalClients} total`, trend: 'neutral' as const, sub: 'Ce mois' },
    { label: 'Abonnements actifs', value: String(stats.activeSubscriptions), delta: '', trend: 'neutral' as const },
  ]

  return (
    <>
      <Header title="Tableau de bord" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── KPIs ──────────────────────────────────────────────────────────── */}
        <div className={cn('grid gap-3 sm:gap-4', isMedecin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 xl:grid-cols-4')}>
          {kpis.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>

        {/* ── Métriques rapides ──────────────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: CalendarDays,
              label: isMedecin ? 'Mes soins confirmés' : 'RDV confirmés',
              value: todayAppointments.filter(a => a.status === 'confirmed').length,
              color: 'text-primary-600 bg-primary-50',
            },
            {
              icon: Users,
              label: 'Clients servis',
              value: new Set(todayAppointments.filter(a => a.status === 'completed').map(a => a.client_name)).size,
              color: 'text-emerald-600 bg-emerald-50',
            },
            ...(!isMedecin ? [
              {
                icon: UserCheck,
                label: 'Personnel actif',
                value: activeStaff,
                color: 'text-amber-600 bg-amber-50',
              },
              {
                icon: AlertTriangle,
                label: 'Alertes stock',
                value: stats.lowStockCount + stats.outOfStockCount,
                color: stats.lowStockCount + stats.outOfStockCount > 0 ? 'text-rose-600 bg-rose-50' : 'text-stone-400 bg-stone-50',
              },
            ] : []),
          ].map(m => {
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

        {/* ── Charts — cachés pour le thérapeute ────────────────────────────── */}
        {!isMedecin && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Revenue chart */}
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Chiffre d&apos;affaires vs Dépenses</h2>
                <span className="text-xs text-stone-400">6 derniers mois</span>
              </div>
              <RevenueChart data={stats.monthlyData} />
              {/* Résumé financier du mois */}
              <div className="mt-3 flex items-center gap-4 border-t border-stone-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  <span className="text-stone-500">CA</span>
                  <span className="font-semibold text-slate-900">{stats.revenueMonth.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="text-stone-500">Dépenses</span>
                  <span className="font-semibold text-slate-900">{stats.expensesMonth.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs">
                  {stats.profit >= 0
                    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                  <span className={cn('font-semibold', stats.profit >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                    {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            </div>

            {/* Top services */}
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <h2 className="mb-3 font-semibold text-slate-900">Prestations populaires</h2>
              <ServicesChart data={stats.topServices} />
              <div className="mt-3 space-y-2">
                {stats.topServices.length > 0 ? stats.topServices.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-600 truncate">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="ml-2 shrink-0 font-medium text-slate-900">{s.percent}%</span>
                  </div>
                )) : (
                  <p className="text-xs text-stone-400 text-center py-2">Aucun RDV ce mois</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Grille : RDV du jour + Activités récentes ─────────────────────── */}
        <div className={cn('mt-6 grid gap-4', !isMedecin && recentLogs.length > 0 ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1')}>

          {/* Rendez-vous du jour */}
          <div className={cn('rounded-lg border border-stone-200 bg-white shadow-xs', !isMedecin && recentLogs.length > 0 ? 'lg:col-span-3' : '')}>
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                {isMedecin ? 'Mes soins du jour' : 'Rendez-vous du jour'}
              </h2>
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                {todayAppointments.length} RDV
              </span>
            </div>
            {todayAppointments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-stone-400">
                {isMedecin ? 'Aucun soin prévu aujourd\'hui' : 'Aucun rendez-vous aujourd\'hui'}
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {todayAppointments.map(a => (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                    <span className="w-14 shrink-0 font-medium text-slate-900">{a.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{a.client_name}</p>
                      <p className="text-xs text-stone-400 truncate">
                        {a.service_name}
                        {!isMedecin && a.staff_name && ` · ${a.staff_name}`}
                      </p>
                    </div>
                    <span className="hidden text-stone-500 sm:block shrink-0">{a.duration} min</span>
                    {!isMedecin && (
                      <span className="hidden w-24 shrink-0 text-right font-medium text-slate-900 sm:block">
                        {(a.price ?? 0).toLocaleString('fr-FR')} F
                      </span>
                    )}
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? 'bg-stone-100 text-stone-600')}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activités récentes */}
          {!isMedecin && recentLogs.length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-white shadow-xs lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4">
                <Activity className="h-4 w-4 text-stone-400" />
                <h2 className="font-semibold text-slate-900">Activités récentes</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {recentLogs.map(log => {
                  const actionIcon = ACTION_ICONS[log.action] ?? '·'
                  const entityLabel = ENTITY_LABELS[log.entity_type] ?? log.entity_type
                  const date = new Date(log.created_at)
                  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                  const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                  return (
                    <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                      <span className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                        log.action === 'created' ? 'bg-emerald-100 text-emerald-700'
                          : log.action === 'deleted' ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700',
                      )}>
                        {actionIcon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">
                          {entityLabel}
                          {log.entity_name && <span className="text-stone-500 font-normal"> — {log.entity_name}</span>}
                        </p>
                        <p className="text-xs text-stone-400 truncate">{log.actor_email ?? 'Système'}</p>
                      </div>
                      <time className="shrink-0 text-[11px] text-stone-400">
                        {isToday ? timeStr : dateStr}
                      </time>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Résumé stock si alertes ────────────────────────────────────────── */}
        {!isMedecin && (stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              {stats.outOfStockCount > 0 && <span className="font-semibold">{stats.outOfStockCount} produit{stats.outOfStockCount > 1 ? 's' : ''} épuisé{stats.outOfStockCount > 1 ? 's' : ''}</span>}
              {stats.outOfStockCount > 0 && stats.lowStockCount > 0 && <span> · </span>}
              {stats.lowStockCount > 0 && <span>{stats.lowStockCount} en stock bas</span>}
              <span className="ml-2 text-amber-600">— Vérifiez votre inventaire</span>
            </p>
          </div>
        )}

      </div>
    </>
  )
}
