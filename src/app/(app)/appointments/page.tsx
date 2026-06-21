import { Header } from '@/components/layout/header'
import { CalendarView } from '@/components/calendar/calendar-view'
import { todayAppointments } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

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

export default function AppointmentsPage() {
  return (
    <>
      <Header title="Rendez-vous" />
      <div className="flex-1 overflow-y-auto p-6">
        <CalendarView />

        {/* Liste détaillée du jour */}
        <h2 className="mb-3 mt-8 font-semibold text-slate-900">Détail de la journée</h2>
        <div className="grid gap-3">
          {todayAppointments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-xs"
            >
              <div className="flex w-16 flex-col items-center rounded-md bg-primary-50 py-2">
                <span className="text-base font-bold text-primary-700">{a.time}</span>
                <span className="text-xs text-stone-400">{a.duration} min</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{a.client}</p>
                <p className="text-sm text-stone-500">{a.service}</p>
                <p className="text-xs text-stone-400">Thérapeute : {a.therapist}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{a.price.toLocaleString('fr-FR')} F</p>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusStyle[a.status]
                  )}
                >
                  {statusLabel[a.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
