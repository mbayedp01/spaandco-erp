import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export interface KpiDef {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'neutral'
  sub?: string
}

export function KpiCard({ kpi }: { kpi: KpiDef }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-stone-500">{kpi.label}</p>
        {kpi.trend !== 'neutral' && (
          <span
            className={cn(
              'flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {kpi.delta}
          </span>
        )}
        {kpi.trend === 'neutral' && kpi.delta && (
          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
            {kpi.delta}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
      {kpi.sub && <p className="mt-1 text-xs text-stone-400">{kpi.sub}</p>}
    </div>
  )
}
