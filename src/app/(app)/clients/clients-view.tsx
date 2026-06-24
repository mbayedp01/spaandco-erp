'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import type { Database } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { Star, Search, Users, Crown, Sparkles } from 'lucide-react'
import { AddClientButton } from '@/components/forms/client-form'
import { cn } from '@/lib/utils'

type Client = Database['public']['Tables']['clients']['Row']
type Filter = 'tous' | 'vip' | 'nouveaux'

const VIP_THRESHOLD = 150
const LOYALTY_MAX = 250
const NEW_CUTOFF = '2026-05-01'

export function ClientsView({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('tous')

  const vipCount = clients.filter((c) => c.is_vip).length
  const newCount = clients.filter((c) => c.join_date >= NEW_CUTOFF).length

  const filtered = useMemo(() => {
    let list = clients
    if (filter === 'vip') list = list.filter((c) => c.is_vip)
    if (filter === 'nouveaux') list = list.filter((c) => c.join_date >= NEW_CUTOFF)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q)
      )
    }
    return list
  }, [search, filter, clients])

  return (
    <>
      <Header title="Clients" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total clients</p>
              <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Clients VIP</p>
              <p className="text-2xl font-bold text-slate-900">{vipCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Nouveaux (30j)</p>
              <p className="text-2xl font-bold text-slate-900">{newCount}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher un client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-transparent outline-none placeholder:text-stone-400 sm:w-64"
              />
            </div>
            <div className="flex rounded-md border border-stone-200 bg-white text-sm">
              {(['tous', 'vip', 'nouveaux'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-2 font-medium capitalize transition-colors first:rounded-l-md last:rounded-r-md cursor-pointer',
                    filter === f ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                  )}
                >
                  {f === 'tous' ? 'Tous' : f === 'vip' ? 'VIP' : 'Nouveaux'}
                </button>
              ))}
            </div>
          </div>
          <AddClientButton />
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="hidden px-5 py-3 md:table-cell">Contact</th>
                <th className="px-5 py-3">Fidélité</th>
                <th className="hidden px-5 py-3 lg:table-cell">CA total</th>
                <th className="hidden px-5 py-3 sm:table-cell">Dernière visite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-stone-400">Aucun client trouvé</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 font-medium text-slate-900">
                            {c.first_name} {c.last_name}
                            {c.is_vip && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                          </p>
                          <p className="text-xs text-stone-400">{c.visits_count} visite{c.visits_count > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      <p className="text-slate-700">{c.email}</p>
                      <p className="text-xs text-stone-400">{c.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn('font-semibold', c.loyalty_points >= VIP_THRESHOLD ? 'text-amber-600' : 'text-primary-600')}>
                            {c.loyalty_points} pts
                          </span>
                          {c.is_vip && <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">VIP</span>}
                        </div>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={cn('h-full rounded-full', c.loyalty_points >= VIP_THRESHOLD ? 'bg-amber-400' : 'bg-primary-500')}
                            style={{ width: `${Math.min((c.loyalty_points / LOYALTY_MAX) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 font-medium text-slate-900 lg:table-cell">
                      {c.total_spent.toLocaleString('fr-FR')} F
                    </td>
                    <td className="hidden px-5 py-3.5 text-stone-500 sm:table-cell">
                      {c.last_visit ? formatDate(c.last_visit) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="border-t border-stone-100 px-5 py-3 text-xs text-stone-400">
            {filtered.length} client{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  )
}
