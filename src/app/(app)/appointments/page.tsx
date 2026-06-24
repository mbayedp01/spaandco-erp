import { Header } from '@/components/layout/header'
import { getAppointments } from '@/lib/db/appointments'
import { getStaff } from '@/lib/db/staff'
import { getServices } from '@/lib/db/services'
import { getCurrentSpaId } from '@/lib/spa'
import { cn } from '@/lib/utils'
import { AddAppointmentButton } from '@/components/forms/appointment-form'
import { AppointmentStatusButtons } from './appointment-status-buttons'

const statusStyle: Record<string, string> = {
  confirmed:  'bg-emerald-50 text-emerald-700',
  pending:    'bg-amber-50 text-amber-700',
  completed:  'bg-stone-100 text-stone-600',
  cancelled:  'bg-rose-50 text-rose-700',
}

const statusLabel: Record<string, string> = {
  confirmed:  'Confirmé',
  pending:    'En attente',
  completed:  'Terminé',
  cancelled:  'Annulé',
}

export default async function AppointmentsPage() {
  const spaId = getCurrentSpaId()
  const [appointments, staffList, services] = await Promise.all([
    getAppointments(spaId),
    getStaff(spaId),
    getServices(),
  ])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter((a) => a.date === today)
  const upcoming   = appointments.filter((a) => a.date > today).slice(0, 20)

  const staffNames   = staffList.map((s) => `${s.first_name} ${s.last_name}`)
  const serviceNames = services.map((s) => s.name)

  const counts = {
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  }

  return (
    <>
      <Header title="Rendez-vous" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Aujourd'hui", value: todayAppts.length, color: 'text-primary-700' },
            { label: 'Confirmés',   value: counts.confirmed,  color: 'text-emerald-700' },
            { label: 'En attente',  value: counts.pending,    color: 'text-amber-700' },
            { label: 'Terminés',    value: counts.completed,  color: 'text-stone-500' },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className={cn('mt-1 text-2xl font-bold', k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Aujourd&apos;hui
            <span className="ml-2 text-sm font-normal text-stone-400">({todayAppts.length} RDV)</span>
          </h2>
          <AddAppointmentButton staffNames={staffNames} serviceNames={serviceNames} />
        </div>

        {todayAppts.length === 0 ? (
          <div className="mb-8 rounded-lg border border-dashed border-stone-200 bg-white py-12 text-center">
            <p className="text-stone-400">Aucun rendez-vous aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="mb-8 grid gap-3">
            {todayAppts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex w-16 flex-col items-center rounded-md bg-primary-50 py-2 shrink-0">
                  <span className="text-base font-bold text-primary-700">{a.time}</span>
                  <span className="text-xs text-stone-400">{a.duration} min</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{a.client_name}</p>
                  <p className="text-sm text-stone-500">{a.service_name}</p>
                  {a.staff_name && <p className="text-xs text-stone-400">Thérapeute : {a.staff_name}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-semibold text-slate-900">{(a.price ?? 0).toLocaleString('fr-FR')} F</p>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? statusStyle.pending)}>
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </div>
                <AppointmentStatusButtons id={a.id} currentStatus={a.status} />
              </div>
            ))}
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="mb-3 font-semibold text-slate-900">Prochains rendez-vous</h2>
            <div className="rounded-lg border border-stone-200 bg-white shadow-xs divide-y divide-stone-100">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-stone-50">
                  <span className="w-24 shrink-0 text-xs text-stone-400">{a.date}</span>
                  <span className="w-12 shrink-0 font-medium text-primary-700">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{a.client_name}</p>
                    <p className="text-xs text-stone-400 truncate">{a.service_name ?? '—'}</p>
                  </div>
                  <span className={cn('hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline', statusStyle[a.status] ?? statusStyle.pending)}>
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
