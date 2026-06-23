import { Header } from '@/components/layout/header'
import { createServerClient } from '@/lib/supabase/server'
import { getStaff } from '@/lib/db/staff'
import type { Database } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Appointment = Database['public']['Tables']['appointments']['Row']

const statusDot: Record<string, string> = {
  confirmed: 'bg-primary-500',
  pending: 'bg-amber-400',
  completed: 'bg-stone-400',
  cancelled: 'bg-rose-400',
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
    return {
      short: DAY_NAMES[i],
      date: d.getDate(),
      iso: d.toISOString().split('T')[0],
    }
  })
}

async function getWeekAppointments(start: string, end: string): Promise<Appointment[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('time')
  if (error) console.error('getWeekAppointments:', error.message)
  return (data as Appointment[] | null) ?? []
}

export default async function PlanningPage() {
  const weekDays = getWeekDates()
  const today = new Date().toISOString().split('T')[0]
  const todayIndex = weekDays.findIndex(d => d.iso === today)

  const [staff, weekAppointments] = await Promise.all([
    getStaff(),
    getWeekAppointments(weekDays[0].iso, weekDays[5].iso),
  ])

  const therapists = staff.filter(s => s.role === 'Thérapeute' || s.role === 'Esthéticienne')
  const totalRdv = weekAppointments.filter(a => a.status !== 'cancelled').length

  const weekLabel = (() => {
    const start = new Date(weekDays[0].iso)
    const end = new Date(weekDays[5].iso)
    const fmtDay = (d: Date) => d.getDate()
    const fmtMonth = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return `${fmtDay(start)} – ${fmtDay(end)} ${fmtMonth(end)}`
  })()

  return (
    <>
      <Header title="Planning" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Barre navigation semaine */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-stone-200 bg-white">
              <button className="p-2 text-stone-500 hover:bg-stone-50 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="border-x border-stone-200 px-4 py-1.5 text-sm font-medium text-slate-900">
                {weekLabel}
              </span>
              <button className="p-2 text-stone-500 hover:bg-stone-50 cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Aujourd&apos;hui
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-500">
            {Object.entries({ confirmed: ['bg-primary-500', 'Confirmé'], pending: ['bg-amber-400', 'En attente'], completed: ['bg-stone-400', 'Terminé'], cancelled: ['bg-rose-400', 'Annulé'] }).map(([k, [cls, label]]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full inline-block', cls)} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'RDV cette semaine', value: totalRdv },
            { label: 'Thérapeutes actifs', value: therapists.filter(t => t.status === 'active').length },
            { label: 'Heures planifiées', value: `${Math.floor(weekAppointments.filter(a => a.status !== 'cancelled').reduce((s, a) => s + (a.duration ?? 0), 0) / 60)}h` },
            { label: 'Taux de remplissage', value: `${Math.min(100, Math.round(totalRdv / Math.max(1, therapists.length * 6) * 100 * 3))}%` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Grille planning */}
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="min-w-[700px]">
            {/* En-tête jours */}
            <div className="grid border-b border-stone-200" style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}>
              <div className="border-r border-stone-200 px-4 py-3 text-xs font-medium text-stone-400">
                Thérapeute
              </div>
              {weekDays.map((d, i) => (
                <div
                  key={d.short}
                  className={cn('border-r border-stone-200 px-3 py-3 text-center last:border-r-0', i === todayIndex && 'bg-primary-50')}
                >
                  <p className={cn('text-xs', i === todayIndex ? 'text-primary-600 font-semibold' : 'text-stone-400')}>
                    {d.short}
                  </p>
                  <span className={cn('flex h-7 w-7 mx-auto items-center justify-center rounded-full text-sm font-semibold', i === todayIndex ? 'bg-primary-600 text-white' : 'text-slate-900')}>
                    {d.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Lignes thérapeutes */}
            {therapists.map((t) => {
              const isAbsent = t.status !== 'active'
              const fullName = `${t.first_name} ${t.last_name}`
              return (
                <div
                  key={t.id}
                  className={cn('grid border-b border-stone-100 last:border-b-0', isAbsent && 'opacity-50')}
                  style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}
                >
                  <div className="flex items-center gap-2 border-r border-stone-100 px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {t.first_name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-900">{t.first_name}</p>
                      <p className="truncate text-[10px] text-stone-400">{t.role}</p>
                    </div>
                    {isAbsent && (
                      <span className="ml-auto rounded bg-rose-50 px-1 py-0.5 text-[9px] font-medium text-rose-600">
                        {t.status === 'conge' ? 'Congé' : 'Abs.'}
                      </span>
                    )}
                  </div>

                  {weekDays.map((day, dayIdx) => {
                    const dayAppts = weekAppointments.filter(a => a.staff_name === fullName && a.date === day.iso)
                    return (
                      <div
                        key={dayIdx}
                        className={cn('border-r border-stone-100 px-2 py-2.5 last:border-r-0', dayIdx === todayIndex && 'bg-primary-50/30')}
                      >
                        {isAbsent ? (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-xs text-stone-300">—</span>
                          </div>
                        ) : dayAppts.length === 0 ? (
                          <div className="flex h-full min-h-[52px] items-center justify-center rounded-md border border-dashed border-stone-200">
                            <span className="text-[10px] text-stone-300">Libre</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {dayAppts.map((a) => (
                              <div
                                key={a.id}
                                className={cn(
                                  'flex items-center gap-1.5 rounded px-2 py-1 text-[10px]',
                                  a.status === 'confirmed' && 'bg-primary-50 text-primary-800',
                                  a.status === 'pending' && 'bg-amber-50 text-amber-800',
                                  a.status === 'completed' && 'bg-stone-100 text-stone-600',
                                  a.status === 'cancelled' && 'bg-rose-50 text-rose-700 line-through opacity-70'
                                )}
                                title={`${a.time} · ${a.client_name} · ${a.service_name}`}
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
          </div>
        </div>

        {/* Récap par thérapeute */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {therapists.filter(t => t.status === 'active').map((t) => {
            const fullName = `${t.first_name} ${t.last_name}`
            const rdvCount = weekAppointments.filter(a => a.staff_name === fullName && a.status !== 'cancelled').length
            const ca = weekAppointments.filter(a => a.staff_name === fullName && a.status === 'confirmed').reduce((s, a) => s + (a.price ?? 0), 0)
            return (
              <div key={t.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {t.first_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.first_name} {t.last_name}</p>
                    <p className="text-[10px] text-stone-400">{t.specialty ?? t.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-md bg-stone-50 p-2">
                    <p className="text-lg font-bold text-primary-700">{rdvCount}</p>
                    <p className="text-[10px] text-stone-400">RDV</p>
                  </div>
                  <div className="rounded-md bg-stone-50 p-2">
                    <p className="text-sm font-bold text-emerald-700">{(ca / 1000).toFixed(0)}k F</p>
                    <p className="text-[10px] text-stone-400">CA</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
