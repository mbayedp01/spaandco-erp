'use client'

import { useState, useMemo, useTransition } from 'react'
import type { Database } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { Clock, Search, Trash2 } from 'lucide-react'
import { AddServiceButton, EditServiceButton } from '@/components/forms/service-form'
import { deleteServiceAction } from '@/app/actions/services'

type Service = Database['public']['Tables']['services']['Row']

const categoryColors: Record<string, string> = {
  Massages:      'text-primary-600 bg-primary-50',
  'Soins visage':'text-pink-600 bg-pink-50',
  'Soins corps': 'text-emerald-600 bg-emerald-50',
  Beauté:        'text-purple-600 bg-purple-50',
}

const ALL_CATEGORIES = ['Tous', 'Massages', 'Soins visage', 'Soins corps', 'Beauté']

function DeleteServiceButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer cette prestation ?')) return
    startTransition(async () => { await deleteServiceAction(id) })
  }
  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40"
      title="Supprimer"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

export function ServicesView({ services }: { services: Service[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')

  const active = services.filter((s) => s.active).length
  const avgPrice = services.length > 0 ? Math.round(services.filter(s => s.active).reduce((s, i) => s + (i.price ?? 0), 0) / active) : 0
  const avgDuration = services.length > 0 ? Math.round(services.filter(s => s.active).reduce((s, i) => s + (i.duration ?? 0), 0) / active) : 0

  const filtered = useMemo(() => {
    let list = services
    if (category !== 'Tous') list = list.filter((s) => s.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q))
    }
    return list
  }, [services, search, category])

  return (
    <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Actives', value: `${active} sur ${services.length} total`, main: String(active) },
            { label: 'Prix moyen', value: null, main: `${avgPrice.toLocaleString('fr-FR')} F` },
            { label: 'Durée moyenne', value: null, main: `${avgDuration} min` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-sm text-stone-500">{k.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{k.main}</p>
              {k.value && <p className="text-xs text-stone-400">{k.value}</p>}
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                  category === cat ? 'bg-primary-600 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                )}
              >
                {cat}
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm">
              <Search className="h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 bg-transparent outline-none placeholder:text-stone-400"
              />
            </div>
          </div>
          <AddServiceButton />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className={cn('overflow-hidden rounded-lg border bg-white shadow-xs transition-shadow hover:shadow-md', !s.active && 'opacity-60')}>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', categoryColors[s.category ?? ''] ?? 'bg-stone-100 text-stone-600')}>
                    {s.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500')}>
                      {s.active ? 'Actif' : 'Inactif'}
                    </span>
                    <EditServiceButton service={s} />
                    <DeleteServiceButton id={s.id} />
                  </div>
                </div>
                <h3 className="mb-1 text-base font-semibold text-slate-900">{s.name}</h3>
                {s.description && <p className="mb-4 text-xs text-stone-500 line-clamp-2">{s.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration} min
                  </span>
                  <span className="text-base font-bold text-slate-900">{(s.price ?? 0).toLocaleString('fr-FR')} F</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
