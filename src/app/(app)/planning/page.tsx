import { Header } from '@/components/layout/header'
import { createServerClient } from '@/lib/supabase/server'
import { getStaff } from '@/lib/db/staff'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole, getCurrentUserName } from '@/lib/user-role'
import type { Database } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { AddAppointmentButton } from '@/components/forms/appointment-form'
import { getServices } from '@/lib/db/services'
import { MedecinAppointmentActions } from '../appointments/medecin-actions'
import { ChevronLeft, ChevronRight, CalendarDays, UserCheck, Clock, Users } from 'lucide-react'

type Appointment = Database['public']['Tables']['appointments']['Row']

const statusStyle: Record<string, string> = {
  confirmed: 'bg-primary-50 text-primary-700',
  pending:   'bg-amber-50 text-amber-700',
  completed: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-rose-50 text-rose-600',
}
const statusLabel: Record<string, string> = {
  confirmed: 'Confirmé', pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé',
}
const statusDot: Record<string, string> = {
  confirmed: 'bg-primary-500', pending: 'bg-amber-400', completed: 'bg-stone-400', cancelled: 'bg-rose-400',
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function getWeekDates() {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow))
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { short: DAY_NAMES[i], date: d.getDate(), iso: d.toISOString().split('T')[0] }
  })
}

async function getWeekAppointments(
  start: string, end: string, spaId?: string, staffName?: string | null
): Promise<Appointment[]> {
  const supabase = createServerClient()
  let q = supabase.from('appointments').select('*').gte('date', start).lte('date', end).order('time')
  if (spaId)     q = q.eq('spa_id', spaId)
  if (staffName) q = (q as any).eq('staff_name', staffName)
  const { data, error } = await q
  if (error) console.error('getWeekAppointments:', error.message)
  return (data as Appointment[] | null) ?? []
}

// ─── Vue Médecin ──────────────────────────────────────────────────────────────

function MedecinView({
  appointments, weekDays, todayIndex, weekLabel,
}: {
  appointments: Appointment[]
  weekDays: ReturnType<typeof getWeekDates>
  todayIndex: number
  weekLabel: string
}) {
  const today       = weekDays[todayIndex]?.iso ?? new Date().toISOString().split('T')[0]
  const todayAppts  = appointments.filter(a => a.date === today && a.status !== 'cancelled')
  const upcoming    = appointments.filter(a => a.date > today && a.status !== 'cancelled').slice(0, 15)

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-400">Semaine du <span className="font-medium text-slate-700">{weekLabel}</span></p>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-50 px-4 py-2 text-center">
            <p className="text-xl font-bold text-primary-700">{todayAppts.length}</p>
            <p className="text-xs text-stone-400">Aujourd&apos;hui</p>
          </div>
          <div className="rounded-xl bg-stone-50 px-4 py-2 text-center">
            <p className="text-xl font-bold text-slate-700">{upcoming.length}</p>
            <p className="text-xs text-stone-400">À venir</p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-semibold text-slate-900">
        Mes soins d&apos;aujourd&apos;hui
        <span className="ml-2 text-sm font-normal text-stone-400">({todayAppts.length})</span>
      </h2>

      {todayAppts.length === 0 ? (
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-14">
          <CalendarDays className="mb-2 h-9 w-9 text-stone-300" />
          <p className="text-sm text-stone-400">Aucun soin prévu aujourd&apos;hui</p>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          {todayAppts.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-primary-50 py-2">
                <span className="text-base font-bold text-primary-700">{a.time ?? '—'}</span>
                <span className="text-xs text-stone-400">{a.duration ?? '—'} min</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{a.client_name ?? '—'}</p>
                <p className="text-sm text-stone-500">{a.service_name ?? 'Soin non spécifié'}</p>
                {a.notes && (
                  <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 italic">
                    📝 {a.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? statusStyle.pending)}>
                  {statusLabel[a.status] ?? a.status}
                </span>
                <MedecinAppointmentActions id={a.id} currentStatus={a.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mb-3 font-semibold text-slate-900">Prochains rendez-vous</h2>
          <div className="rounded-xl border border-stone-200 bg-white shadow-xs divide-y divide-stone-100">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-28 shrink-0">
                  <p className="text-xs font-medium text-slate-700">{a.date}</p>
                  <p className="text-xs text-stone-400">{a.time ?? '—'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.client_name ?? '—'}</p>
                  <p className="text-xs text-stone-400 truncate">{a.service_name ?? '—'}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? statusStyle.pending)}>
                  {statusLabel[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Vue Caissier / Admin ─────────────────────────────────────────────────────

function AdminCaissierView({
  appointments, staff, staffNames, serviceNames, weekDays, todayIndex, weekLabel, showCA,
}: {
  appointments: Appointment[]
  staff: Awaited<ReturnType<typeof getStaff>>
  staffNames: string[]
  serviceNames: string[]
  weekDays: ReturnType<typeof getWeekDates>
  todayIndex: number
  weekLabel: string
  showCA: boolean
}) {
  const today      = weekDays[todayIndex]?.iso ?? new Date().toISOString().split('T')[0]
  const therapists = staff.filter(s =>
    ['Thérapeute', 'Esthéticienne', 'Médecin', 'Thérapeute/Médecin'].includes(s.role)
  )
  const totalRdv   = appointments.filter(a => a.status !== 'cancelled').length
  const todayCount = appointments.filter(a => a.date === today && a.status !== 'cancelled').length

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {/* Nav semaine + bouton affecter */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-stone-200 bg-white">
            <button className="rounded-l-lg p-2 text-stone-500 hover:bg-stone-50 cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="border-x border-stone-200 px-4 py-1.5 text-sm font-medium text-slate-900">
              {weekLabel}
            </span>
            <button className="rounded-r-lg p-2 text-stone-500 hover:bg-stone-50 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <AddAppointmentButton staffNames={staffNames} serviceNames={serviceNames} />
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: CalendarDays, label: 'RDV cette semaine', value: totalRdv,       color: 'text-primary-700', bg: 'bg-primary-50' },
          { icon: UserCheck,    label: 'Médecins actifs',   value: therapists.filter(t => t.status === 'active').length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { icon: Clock,        label: 'Heures planifiées', value: `${Math.floor(appointments.filter(a=>a.status!=='cancelled').reduce((s,a)=>s+(a.duration??0),0)/60)}h`, color: 'text-amber-700', bg: 'bg-amber-50' },
          { icon: Users,        label: "Aujourd'hui",       value: todayCount,      color: 'text-slate-700',   bg: 'bg-stone-50' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', k.bg)}>
                <k.icon className={cn('h-4 w-4', k.color)} />
              </div>
              <p className="text-xs text-stone-400">{k.label}</p>
            </div>
            <p className={cn('text-2xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Grille semaine */}
      <h2 className="mb-3 font-semibold text-slate-900">
        Planning de la semaine
        <span className="ml-2 text-sm font-normal text-stone-400">(vue par médecin)</span>
      </h2>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="min-w-[700px]">
          <div className="grid border-b border-stone-200" style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}>
            <div className="border-r border-stone-200 px-4 py-3 text-xs font-medium text-stone-400">Médecin</div>
            {weekDays.map((d, i) => (
              <div key={d.short} className={cn('border-r border-stone-200 px-3 py-3 text-center last:border-r-0', i === todayIndex && 'bg-primary-50')}>
                <p className={cn('text-xs', i === todayIndex ? 'text-primary-600 font-semibold' : 'text-stone-400')}>{d.short}</p>
                <span className={cn('mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold', i === todayIndex ? 'bg-primary-600 text-white' : 'text-slate-900')}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          {therapists.map((t) => {
            const fullName = `${t.first_name} ${t.last_name}`
            const isAbsent = t.status !== 'active'
            return (
              <div key={t.id} className={cn('grid border-b border-stone-100 last:border-b-0', isAbsent && 'opacity-50')} style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}>
                <div className="flex items-center gap-2 border-r border-stone-100 px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {t.first_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{t.first_name}</p>
                    <p className="truncate text-[10px] text-stone-400">{t.role}</p>
                  </div>
                </div>
                {weekDays.map((day, di) => {
                  const dayAppts = appointments.filter(a => a.staff_name === fullName && a.date === day.iso)
                  return (
                    <div key={di} className={cn('border-r border-stone-100 px-2 py-2.5 last:border-r-0', di === todayIndex && 'bg-primary-50/30')}>
                      {dayAppts.length === 0 ? (
                        <div className="flex h-full min-h-[52px] items-center justify-center rounded-lg border border-dashed border-stone-200">
                          <span className="text-[10px] text-stone-300">Libre</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {dayAppts.map((a) => (
                            <div key={a.id}
                              className={cn('flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]',
                                a.status === 'confirmed' && 'bg-primary-50 text-primary-800',
                                a.status === 'pending'   && 'bg-amber-50 text-amber-800',
                                a.status === 'completed' && 'bg-stone-100 text-stone-600',
                                a.status === 'cancelled' && 'bg-rose-50 text-rose-600 line-through opacity-70'
                              )}
                              title={`${a.time} · ${a.client_name}`}
                            >
                              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDot[a.status] ?? 'bg-stone-400')} />
                              <span className="font-medium">{a.time}</span>
                              <span className="truncate">{(a.client_name ?? '').split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {therapists.length === 0 && (
            <div className="py-12 text-center text-sm text-stone-400">
              Aucun médecin enregistré — ajoutez du personnel d&apos;abord.
            </div>
          )}
        </div>
      </div>

      {/* Récap médecins */}
      {therapists.filter(t => t.status === 'active').length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {therapists.filter(t => t.status === 'active').map((t) => {
            const fullName = `${t.first_name} ${t.last_name}`
            const rdvCount = appointments.filter(a => a.staff_name === fullName && a.status !== 'cancelled').length
            const ca = appointments.filter(a => a.staff_name === fullName && a.status === 'confirmed').reduce((s, a) => s + (a.price ?? 0), 0)
            return (
              <div key={t.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {t.first_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.first_name} {t.last_name}</p>
                    <p className="text-[10px] text-stone-400">{t.specialty ?? t.role}</p>
                  </div>
                </div>
                <div className={cn('grid gap-2 text-center', showCA ? 'grid-cols-2' : 'grid-cols-1')}>
                  <div className="rounded-lg bg-stone-50 p-2">
                    <p className="text-lg font-bold text-primary-700">{rdvCount}</p>
                    <p className="text-[10px] text-stone-400">RDV</p>
                  </div>
                  {showCA && (
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="text-sm font-bold text-emerald-700">{(ca / 1000).toFixed(0)}k F</p>
                      <p className="text-[10px] text-stone-400">CA</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export default async function PlanningPage() {
  const spaId = getCurrentSpaId()
  const [userRole, userName, staffList, services] = await Promise.all([
    getCurrentUserRole(),
    getCurrentUserName(),
    getStaff(spaId),
    getServices(),
  ])

  const weekDays   = getWeekDates()
  const today      = new Date().toISOString().split('T')[0]
  const todayIndex = weekDays.findIndex(d => d.iso === today)

  const weekLabel = (() => {
    const s = new Date(weekDays[0].iso), e = new Date(weekDays[5].iso)
    return `${s.getDate()} – ${e.getDate()} ${e.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
  })()

  const staffNameFilter  = userRole === 'medecin' ? userName : null
  const weekAppointments = await getWeekAppointments(weekDays[0].iso, weekDays[5].iso, spaId, staffNameFilter)

  const staffNames   = staffList.map(s => `${s.first_name} ${s.last_name}`)
  const serviceNames = services.map(s => s.name)

  const title = userRole === 'medecin'
    ? `Mes rendez-vous${userName ? ` — ${userName}` : ''}`
    : 'Planning'

  return (
    <>
      <Header title={title} />
      {userRole === 'medecin' ? (
        <MedecinView
          appointments={weekAppointments}
          weekDays={weekDays}
          todayIndex={todayIndex}
          weekLabel={weekLabel}
        />
      ) : (
        <AdminCaissierView
          appointments={weekAppointments}
          staff={staffList}
          staffNames={staffNames}
          serviceNames={serviceNames}
          weekDays={weekDays}
          todayIndex={todayIndex}
          weekLabel={weekLabel}
          showCA={userRole === 'admin'}
        />
      )}
    </>
  )
}
