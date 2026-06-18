import { Header } from '@/components/layout/header'
import { clients } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { Star, Plus } from 'lucide-react'

export default function ClientsPage() {
  return (
    <>
      <Header title="Clients" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-stone-500">{clients.length} clients enregistrés</p>
          <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
            <Plus className="h-4 w-4" />
            Nouveau client
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Contact</th>
                <th className="px-5 py-3 font-medium">Fidélité</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Dernière visite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-slate-900">
                          {c.firstName} {c.lastName}
                          {c.isVip && <Star className="h-3.5 w-3.5 fill-accent text-accent" />}
                        </p>
                        <p className="text-xs text-stone-400 md:hidden">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-stone-600 md:table-cell">
                    <p>{c.email}</p>
                    <p className="text-xs text-stone-400">{c.phone}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {c.loyaltyPoints} pts
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-stone-600 sm:table-cell">
                    {formatDate(c.lastVisit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
