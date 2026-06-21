'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { services } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Clock, Plus, Search } from 'lucide-react'

const categories = ['Tous', 'Massages', 'Soins visage', 'Soins corps', 'Beauté']

const categoryColor: Record<string, string> = {
  Massages: 'bg-primary-50 text-primary-700',
  'Soins visage': 'bg-pink-50 text-pink-700',
  'Soins corps': 'bg-emerald-50 text-emerald-700',
  Beauté: 'bg-purple-50 text-purple-700',
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = services
    if (activeCategory !== 'Tous') list = list.filter((s) => s.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    }
    return list
  }, [activeCategory, search])

  const activeCount = services.filter((s) => s.active).length
  const avgPrice = Math.round(services.filter((s) => s.active).reduce((sum, s) => sum + s.price, 0) / activeCount)
  const avgDuration = Math.round(services.filter((s) => s.active).reduce((sum, s) => sum + s.duration, 0) / activeCount)

  return (
    <>
      <Header title="Prestations" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Actives</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
            <p className="mt-0.5 text-xs text-stone-400">sur {services.length} total</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Prix moyen</p>
            <p className="mt-1 text-2xl font-bold text-primary-700">{avgPrice.toLocaleString('fr-FR')} F</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Durée moyenne</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{avgDuration} min</p>
          </div>
        </div>

        {/* Barre recherche + filtres */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs catégories */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                    activeCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-500 focus-within:border-primary-400">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 bg-transparent outline-none placeholder:text-stone-400"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </button>
        </div>

        {/* Grille */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white py-16 text-center text-stone-400">
            Aucune prestation trouvée
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'rounded-lg border bg-white p-5 shadow-xs transition-shadow hover:shadow-md',
                  s.active ? 'border-stone-200' : 'border-stone-100 opacity-60'
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', categoryColor[s.category] ?? 'bg-stone-100 text-stone-600')}>
                    {s.category}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500')}>
                    {s.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500 line-clamp-2">{s.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
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
        )}
        <p className="mt-4 text-xs text-stone-400">{filtered.length} prestation{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}</p>
      </div>
    </>
  )
}
