import { Header } from '@/components/layout/header'
import { campaigns } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Mail, MessageSquare, Tag, Plus } from 'lucide-react'

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  terminee: { label: 'Terminée', className: 'bg-stone-100 text-stone-600' },
  brouillon: { label: 'Brouillon', className: 'bg-amber-50 text-amber-700' },
}

const typeIcon = {
  SMS: MessageSquare,
  Email: Mail,
  Promo: Tag,
}

export default function MarketingPage() {
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0)
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0)
  const rate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

  return (
    <>
      <Header title="Marketing" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Campagnes actives', value: campaigns.filter((c) => c.status === 'active').length },
            { label: 'Messages envoyés', value: totalSent },
            { label: "Taux d'ouverture", value: `${rate}%` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-sm text-stone-500">{k.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Campagnes */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Campagnes</h2>
            <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
              <Plus className="h-4 w-4" />
              Nouvelle
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {campaigns.map((c) => {
              const sc = statusConfig[c.status]
              const Icon = typeIcon[c.type]
              const openRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-stone-400">{c.target} · {c.date}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-slate-900">{c.sent} envois</p>
                    <p className="text-xs text-stone-400">{openRate}% ouverture</p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                    {sc.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
