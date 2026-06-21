import { Header } from '@/components/layout/header'
import { staff } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { UserCheck, UserX, Palmtree, Plus, Star } from 'lucide-react'

const statusConfig = {
  active: { label: 'Actif', className: 'bg-emerald-50 text-emerald-700' },
  absent: { label: 'Absent', className: 'bg-rose-50 text-rose-700' },
  conge: { label: 'Congé', className: 'bg-amber-50 text-amber-700' },
}

const roleColor: Record<string, string> = {
  Thérapeute: 'bg-primary-50 text-primary-700',
  Réceptionniste: 'bg-purple-50 text-purple-700',
  Manager: 'bg-slate-100 text-slate-700',
  Esthéticienne: 'bg-pink-50 text-pink-700',
}

const ratings: Record<string, number> = {
  '1': 4.9,
  '2': 4.7,
  '3': 4.8,
  '6': 4.6,
  '7': 4.5,
}

export default function StaffPage() {
  const active = staff.filter((s) => s.status === 'active').length
  const absent = staff.filter((s) => s.status === 'absent').length
  const conge = staff.filter((s) => s.status === 'conge').length
  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0)

  return (
    <>
      <Header title="Gestion du personnel" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Actifs</p>
              <p className="text-2xl font-bold text-slate-900">{active}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
              <UserX className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Absents</p>
              <p className="text-2xl font-bold text-slate-900">{absent}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <Palmtree className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">En congé</p>
              <p className="text-2xl font-bold text-slate-900">{conge}</p>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs text-stone-500">Masse salariale</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{totalSalary.toLocaleString('fr-FR')} F</p>
            <p className="text-xs text-stone-400">/ mois</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Équipe ({staff.length} membres)</h2>
            <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="hidden px-5 py-3 md:table-cell">Spécialité</th>
                  <th className="hidden px-5 py-3 sm:table-cell">RDV auj.</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Note</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Salaire</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {staff.map((member) => {
                  const sc = statusConfig[member.status]
                  const rating = ratings[member.id]
                  return (
                    <tr key={member.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                            {member.firstName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-stone-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor[member.role])}>
                          {member.role}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-stone-500 md:table-cell">{member.specialty}</td>
                      <td className="hidden px-5 py-3.5 sm:table-cell">
                        <span className={cn('font-medium', member.rdvCount > 0 ? 'text-primary-700' : 'text-stone-300')}>
                          {member.rdvCount > 0 ? `${member.rdvCount}` : '—'}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 lg:table-cell">
                        {rating ? (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            <span className="text-sm font-medium text-slate-900">{rating}</span>
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3.5 font-medium text-slate-900 lg:table-cell">
                        {member.salary.toLocaleString('fr-FR')} F
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                          {sc.label}
                        </span>
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
