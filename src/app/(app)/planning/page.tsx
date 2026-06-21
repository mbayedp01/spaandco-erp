import { Header } from '@/components/layout/header'
import { staff, appointments, weekDays, TODAY_INDEX } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const statusDot: Record<string, string> = {
  confirmed: 'bg-primary-500',
  pending: 'bg-amber-400',
  completed: 'bg-stone-400',
  cancelled: 'bg-rose-400',
}

const therapists = staff.filter((s) => s.role === 'Thérapeute' || s.role === 'Esthéticienne')

export default function PlanningPage() {
  const totalRdv = appointments.filter((a) => a.status !== 'cancelled').length
  const workingDays = weekDays.slice(0, 6)

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
                16 – 22 juin 2026
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
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-500 inline-block" />Confirmé</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />En attente</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-stone-400 inline-block" />Terminé</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400 inline-block" />Annulé</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'RDV cette semaine', value: totalRdv },
            { label: 'Thérapeutes actifs', value: therapists.filter((t) => t.status === 'active').length },
            { label: 'Heures planifiées', value: `${appointments.filter(a => a.status !== 'cancelled').reduce((s, a) => s + a.duration, 0) / 60 | 0}h` },
            { label: 'Taux de remplissage', value: '74%' },
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
              {workingDays.map((d, i) => (
                <div
                  key={d.short}
                  className={cn(
                    'border-r border-stone-200 px-3 py-3 text-center last:border-r-0',
                    i === TODAY_INDEX && 'bg-primary-50'
                  )}
                >
                  <p className={cn('text-xs', i === TODAY_INDEX ? 'text-primary-600 font-semibold' : 'text-stone-400')}>
                    {d.short}
                  </p>
                  <span
                    className={cn(
                      'flex h-7 w-7 mx-auto items-center justify-center rounded-full text-sm font-semibold',
                      i === TODAY_INDEX ? 'bg-primary-600 text-white' : 'text-slate-900'
                    )}
                  >
                    {d.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Lignes thérapeutes */}
            {therapists.map((t) => {
              const isAbsent = t.status !== 'active'
              return (
                <div
                  key={t.id}
                  className={cn(
                    'grid border-b border-stone-100 last:border-b-0',
                    isAbsent && 'opacity-50'
                  )}
                  style={{ gridTemplateColumns: '160px repeat(6, 1fr)' }}
                >
                  {/* Nom thérapeute */}
                  <div className="flex items-center gap-2 border-r border-stone-100 px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {t.firstName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-900">{t.firstName}</p>
                      <p className="truncate text-[10px] text-stone-400">{t.role}</p>
                    </div>
                    {isAbsent && (
                      <span className="ml-auto rounded bg-rose-50 px-1 py-0.5 text-[9px] font-medium text-rose-600">
                        {t.status === 'conge' ? 'Congé' : 'Abs.'}
                      </span>
                    )}
                  </div>

                  {/* Cellules par jour */}
                  {workingDays.map((_, dayIdx) => {
                    const dayAppts = appointments.filter(
                      (a) => a.therapist === `${t.firstName} ${t.lastName}` && a.day === dayIdx
                    )
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          'border-r border-stone-100 px-2 py-2.5 last:border-r-0',
                          dayIdx === TODAY_INDEX && 'bg-primary-50/30'
                        )}
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
                                title={`${a.time} · ${a.client} · ${a.service}`}
                              >
                                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDot[a.status])} />
                                <span className="font-medium">{a.time}</span>
                                <span className="truncate">{a.client.split(' ')[0]}</span>
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
          {therapists.filter((t) => t.status === 'active').map((t) => {
            const rdvCount = appointments.filter((a) => a.therapist === `${t.firstName} ${t.lastName}` && a.status !== 'cancelled').length
            const ca = appointments.filter((a) => a.therapist === `${t.firstName} ${t.lastName}` && a.status === 'confirmed').reduce((s, a) => s + a.price, 0)
            return (
              <div key={t.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {t.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.firstName} {t.lastName}</p>
                    <p className="text-[10px] text-stone-400">{t.specialty}</p>
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
