'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import type { Database } from '@/lib/supabase/types'
import { CampaignBarChart } from '@/components/reports/charts'
import { cn } from '@/lib/utils'
import { Mail, MessageSquare, Tag, Plus, Users, Send, Eye } from 'lucide-react'

type Campaign = Database['public']['Tables']['campaigns']['Row']

const statusConfig: Record<string, { label: string; className: string }> = {
  active:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700' },
  terminee:  { label: 'Terminée', className: 'bg-stone-100 text-stone-600' },
  brouillon: { label: 'Brouillon',className: 'bg-amber-50 text-amber-700' },
}

const typeIcon = { SMS: MessageSquare, Email: Mail, Promo: Tag }
const typeColor: Record<string, string> = {
  SMS:   'bg-blue-50 text-blue-700',
  Email: 'bg-purple-50 text-purple-700',
  Promo: 'bg-amber-50 text-amber-700',
}

const segments = [
  { name: 'VIP',      count: 6, colorClass: 'bg-amber-50 text-amber-700 border-amber-200',   desc: 'CA > 200 000 F' },
  { name: 'Fidèles',  count: 8, colorClass: 'bg-primary-50 text-primary-700 border-primary-200', desc: 'Plus de 5 visites' },
  { name: 'Inactifs', count: 4, colorClass: 'bg-rose-50 text-rose-700 border-rose-200',       desc: 'Absents depuis 60j' },
  { name: 'Nouveaux', count: 4, colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Moins de 30 jours' },
]

export function MarketingView({ campaigns }: { campaigns: Campaign[] }) {
  const [filter, setFilter] = useState<'Tous' | 'SMS' | 'Email' | 'Promo'>('Tous')

  const totalSent   = campaigns.reduce((s, c) => s + c.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0)
  const rate   = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0
  const active = campaigns.filter((c) => c.status === 'active').length

  const filtered = filter === 'Tous' ? campaigns : campaigns.filter((c) => c.type === filter)

  return (
    <>
      <Header title="Marketing" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Campagnes actives',  value: active,                        icon: Tag,   color: 'bg-primary-50 text-primary-600' },
            { label: 'Messages envoyés',   value: totalSent.toLocaleString('fr-FR'), icon: Send,  color: 'bg-blue-50 text-blue-600' },
            { label: 'Messages ouverts',   value: totalOpened.toLocaleString('fr-FR'), icon: Eye, color: 'bg-purple-50 text-purple-600' },
            { label: "Taux d'ouverture",   value: `${rate}%`,                    icon: Users, color: 'bg-emerald-50 text-emerald-600' },
          ].map((k) => {
            const Icon = k.icon
            return (
              <div key={k.label} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', k.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">{k.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{k.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
            <h2 className="mb-4 font-semibold text-slate-900">Performance des campagnes</h2>
            <CampaignBarChart />
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 font-semibold text-slate-900">Segments clients</h2>
            <div className="space-y-3">
              {segments.map((seg) => (
                <div key={seg.name} className={cn('flex items-center justify-between rounded-lg border p-3', seg.colorClass)}>
                  <div>
                    <p className="text-sm font-semibold">{seg.name}</p>
                    <p className="text-xs opacity-75">{seg.desc}</p>
                  </div>
                  <span className="text-2xl font-bold">{seg.count}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-md border border-stone-200 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer">
              Envoyer une campagne ciblée
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Campagnes</h2>
            <div className="flex items-center gap-2">
              {(['Tous', 'SMS', 'Email', 'Promo'] as const).map((t) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                    filter === t ? 'bg-primary-600 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                  )}>
                  {t}
                </button>
              ))}
              <button className="flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                Nouvelle
              </button>
            </div>
          </div>
          <div className="divide-y divide-stone-100">
            {filtered.map((c) => {
              const sc = statusConfig[c.status] ?? statusConfig.brouillon
              const Icon = typeIcon[c.type as keyof typeof typeIcon] ?? Tag
              const openRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', typeColor[c.type] ?? 'bg-stone-50 text-stone-600')}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-stone-400">{c.target} · {c.date}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-slate-900">{c.sent.toLocaleString('fr-FR')} envois</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${openRate}%` }} />
                      </div>
                      <span className="text-xs text-stone-500">{openRate}%</span>
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>{sc.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
