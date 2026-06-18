import { Header } from '@/components/layout/header'
import { services } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Clock, Plus } from 'lucide-react'

export default function ServicesPage() {
  return (
    <>
      <Header title="Prestations" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-stone-500">{services.length} prestations au catalogue</p>
          <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {s.category}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  )}
                >
                  {s.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{s.name}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-stone-500">
                  <Clock className="h-4 w-4" />
                  {s.duration} min
                </span>
                <span className="text-lg font-bold text-primary-700">
                  {s.price.toLocaleString('fr-FR')} F
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
