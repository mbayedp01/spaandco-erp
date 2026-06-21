'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'
import { DayCalendar } from './day-calendar'
import { WeekCalendar } from './week-calendar'
import { todayAppointments, weekLabel } from '@/lib/mock-data'

type View = 'day' | 'week'

const legend = [
  { label: 'Confirmé', dot: 'bg-primary-500' },
  { label: 'En attente', dot: 'bg-amber-400' },
  { label: 'Terminé', dot: 'bg-stone-400' },
  { label: 'Annulé', dot: 'bg-rose-400' },
]

export function CalendarView() {
  const [view, setView] = useState<View>('day')

  return (
    <div>
      {/* Barre d'outils */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-stone-200 bg-white">
            <button className="p-2 text-stone-500 hover:bg-stone-50 cursor-pointer" aria-label="Précédent">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="border-x border-stone-200 px-3 py-1.5 text-sm font-medium text-slate-900">
              {view === 'day' ? 'Mercredi 18 juin 2026' : weekLabel}
            </span>
            <button className="p-2 text-stone-500 hover:bg-stone-50 cursor-pointer" aria-label="Suivant">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
            Aujourd&apos;hui
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de vue avec icônes */}
          <div className="flex items-center rounded-md border border-stone-200 bg-white p-0.5">
            <button
              onClick={() => setView('day')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                view === 'day' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
              )}
              aria-label="Vue jour"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Jour</span>
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                view === 'week' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
              )}
              aria-label="Vue semaine"
            >
              <CalendarRange className="h-4 w-4" />
              <span className="hidden sm:inline">Semaine</span>
            </button>
          </div>

          <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className={cn('h-2.5 w-2.5 rounded-full', l.dot)} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Calendrier */}
      {view === 'day' ? <DayCalendar appointments={todayAppointments} /> : <WeekCalendar />}
    </div>
  )
}
