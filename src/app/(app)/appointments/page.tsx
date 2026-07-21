import { Header } from '@/components/layout/header'
import { getAppointments } from '@/lib/db/appointments'
import { getStaff } from '@/lib/db/staff'
import { getServices } from '@/lib/db/services'
import { getClients } from '@/lib/db/clients'
import { getCurrentSpaId } from '@/lib/spa'
import { getCurrentUserRole, getCurrentUserName } from '@/lib/user-role'
import { cn } from '@/lib/utils'
import { AddAppointmentButton } from '@/components/forms/appointment-form'
import { AppointmentStatusButtons } from './appointment-status-buttons'
import { MedecinAppointmentActions } from './medecin-actions'
import { CalendarDays } from 'lucide-react'

const statusStyle: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending:   'bg-amber-50 text-amber-700',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-rose-50 text-rose-700',
}
const statusLabel: Record<string, string> = {
  confirmed: 'Confirmé', pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé',
}

export default async function AppointmentsPage() {
  const spaId = getCurrentSpaId()
  const [userRole, userName, staffList, services, clients] = await Promise.all([
    getCurrentUserRole(),
    getCurrentUserName(),
    getStaff(spaId),
    getServices(spaId),
    getClients(spaId),
  ])

  const allAppointments = await getAppointments(spaId)
  const appointments = userRole === 'medecin' && userName
    ? allAppointments.filter(a => a.staff_name === userName)
    : allAppointments

  const today      = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.date === today)
  const upcoming   = appointments.filter(a => a.date > today).slice(0, 20)

  const staffNames = staffList.map(s => `${s.first_name} ${s.last_name}`)

  const clientItems = clients.map(c => ({
    id:   c.id,
    name: `${c.first_name} ${c.last_name}`,
  }))

  const serviceItems = services.map(s => ({
    id:       s.id,
    name:     s.name,
    price:    (s as any).price    ?? null,
    duration: (s as any).duration ?? null,
    category: (s as any).category ?? null,
  }))

  const existingAppts = allAppointments.map(a => ({
    date:       a.date,
    time:       a.time,
    staff_name: a.staff_name ?? null,
    duration:   (a as any).duration ?? null,
  }))

  const counts = {
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  const isMedecin = userRole === 'medecin'

  return (
    <>
      <Header title={isMedecin ? 'Mes soins' : 'Rendez-vous'} />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Aujourd'hui", value: todayAppts.length,  color: 'text-primary-700' },
            { label: 'Confirmés',   value: counts.confirmed,   color: 'text-emerald-700' },
            { label: 'En attente',  value: counts.pending,     color: 'text-amber-700'   },
            { label: 'Terminés',    value: counts.completed,   color: 'text-stone-500'   },
          ].map(k => (
            <div key={k.label} className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className={cn('mt-1 text-2xl font-bold', k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Header + bouton */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            {isMedecin ? "Mes soins d'aujourd'hui" : "Aujourd'hui"}
            <span className="ml-2 text-sm font-normal text-stone-400">({todayAppts.length} RDV)</span>
          </h2>
          {!isMedecin && (
            <AddAppointmentButton
              staffNames={staffNames}
              clients={clientItems}
              services={serviceItems}
              existingAppointments={existingAppts}
            />
          )}
        </div>

        {/* RDV du jour */}
        {todayAppts.length === 0 ? (
          <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-12">
            <CalendarDays className="mb-2 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-400">Aucun rendez-vous aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="mb-8 grid gap-3">
            {todayAppts.map(a => (
              <div key={a.id} className="flex flex-wrap items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-primary-50 py-2">
                  <span className="text-base font-bold text-primary-700">{a.time}</span>
                  <span className="text-xs text-stone-400">{(a as any).duration} min</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{a.client_name}</p>
                  <p className="text-sm text-stone-500">{a.service_name}</p>
                  {!isMedecin && a.staff_name && (
                    <p className="text-xs text-stone-400">Thérapeute : {a.staff_name}</p>
                  )}
                  {a.notes && (
                    <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 italic">
                      📝 {a.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!isMedecin && (
                    <p className="font-semibold text-slate-900">{(a.price ?? 0).toLocaleString('fr-FR')} F</p>
                  )}
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyle[a.status] ?? statusStyle.pending)}>
                    {statusLabel[a.status] ?? a.status}
                  </span>
                  {isMedecin
                    ? <MedecinAppointmentActions id={a.id} currentStatus={a.status} />
                    : <AppointmentStatusButtons id={a.id} currentStatus={a.status} />
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prochains RDV */}
        {upcoming.length > 0 && (
          <>
            <h2 className="mb-3 font-semibold text-slate-900">Prochains rendez-vous</h2>
            <div className="rounded-xl border border-stone-200 bg-white shadow-xs divide-y divide-stone-100">
              {upcoming.map(a => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-stone-50">
                  <span className="w-24 shrink-0 text-xs text-stone-400">{a.date}</span>
                  <span className="w-12 shrink-0 font-medium text-primary-700">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{a.client_name}</p>
                    <p className="text-xs text-stone-400 truncate">{a.service_name ?? '—'}</p>
                  </div>
                  {!isMedecin && a.staff_name && (
                    <span className="hidden text-xs text-stone-400 sm:inline truncate max-w-[120px]">{a.staff_name}</span>
                  )}
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
