import { Header } from '@/components/layout/header'
import { getStaff } from '@/lib/db/staff'
import { getTodayAppointments } from '@/lib/db/appointments'
import { getCurrentSpaId } from '@/lib/spa'
import { cn } from '@/lib/utils'
import { UserCheck, UserX, Palmtree, Star } from 'lucide-react'
import { AddStaffButton, EditStaffButton, DeleteStaffButton } from '@/components/forms/staff-form'

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif',  className: 'bg-emerald-50 text-emerald-700' },
  absent: { label: 'Absent', className: 'bg-rose-50 text-rose-700' },
  conge:  { label: 'Congé',  className: 'bg-amber-50 text-amber-700' },
}

const roleColor: Record<string, string> = {
  'Thérapeute':    'bg-primary-50 text-primary-700',
  'Réceptionniste':'bg-purple-50 text-purple-700',
  'Manager':       'bg-slate-100 text-slate-700',
  'Esthéticienne': 'bg-pink-50 text-pink-700',
}

export default async function StaffPage() {
  const spaId = getCurrentSpaId()
  const [staffList, todayAppts] = await Promise.all([getStaff(spaId), getTodayAppointments(spaId)])

  const rdvCounts: Record<string, number> = {}
  for (const a of todayAppts) {
    if (a.staff_name) rdvCounts[a.staff_name] = (rdvCounts[a.staff_name] ?? 0) + 1
  }

  const active      = staffList.filter((s) => s.status === 'active').length
  const absent      = staffList.filter((s) => s.status === 'absent').length
  const conge       = staffList.filter((s) => s.status === 'conge').length
  const totalSalary = staffList.reduce((sum, s) => sum + (s.salary ?? 0), 0)

  return (
    <>
      <Header title="Personnel" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Actifs</p>
              <p className="text-xl font-bold text-slate-900">{active}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50">
              <UserX className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Absents</p>
              <p className="text-xl font-bold text-slate-900">{absent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Palmtree className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">En congé</p>
              <p className="text-xl font-bold text-slate-900">{conge}</p>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <p className="text-xs text-stone-500">Masse salariale</p>
            <p className="mt-0.5 text-base font-bold text-slate-900">{totalSalary.toLocaleString('fr-FR')} F</p>
            <p className="text-xs text-stone-400">/ mois</p>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="font-semibold text-slate-900">Équipe ({staffList.length})</h2>
            <AddStaffButton />
          </div>

          {/* Mobile: card list */}
          <div className="divide-y divide-stone-100 sm:hidden">
            {staffList.map((member) => {
              const sc = statusConfig[member.status] ?? statusConfig.active
              const fullName = `${member.first_name} ${member.last_name}`
              const rdv = rdvCounts[fullName] ?? 0
              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {member.first_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{fullName}</p>
                    <p className="text-xs text-stone-400">{member.role} {member.specialty ? `· ${member.specialty}` : ''}</p>
                    {rdv > 0 && <p className="text-xs text-primary-600 font-medium">{rdv} RDV auj.</p>}
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                    {sc.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="hidden px-5 py-3 md:table-cell">Spécialité</th>
                  <th className="px-5 py-3">RDV auj.</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Note</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Salaire</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staffList.map((member) => {
                  const sc = statusConfig[member.status] ?? statusConfig.active
                  const fullName = `${member.first_name} ${member.last_name}`
                  const rdv = rdvCounts[fullName] ?? 0
                  return (
                    <tr key={member.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                            {member.first_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{fullName}</p>
                            <p className="text-xs text-stone-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor[member.role] ?? 'bg-stone-100 text-stone-600')}>
                          {member.role}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-stone-500 md:table-cell">{member.specialty}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('font-medium', rdv > 0 ? 'text-primary-700' : 'text-stone-300')}>
                          {rdv > 0 ? rdv : '—'}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 lg:table-cell">
                        {member.rating ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-slate-900">{member.rating}</span>
                          </span>
                        ) : <span className="text-stone-300">—</span>}
                      </td>
                      <td className="hidden px-5 py-3.5 font-medium text-slate-900 lg:table-cell">
                        {member.salary ? `${member.salary.toLocaleString('fr-FR')} F` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-0.5">
                          <EditStaffButton member={member} />
                          <DeleteStaffButton id={member.id} />
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
