import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { MiniSpark } from './charts'
import type { Kpi } from '@/lib/mock-data'

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <p className="text-sm text-stone-500">{kpi.label}</p>
        <span
          className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          )}
        >
          {kpi.trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {kpi.delta}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
      <div className="mt-2">
        <MiniSpark data={kpi.spark} trend={kpi.trend} />
      </div>
    </div>
  )
}
