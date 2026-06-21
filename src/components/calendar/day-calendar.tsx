import { cn } from '@/lib/utils'
import type { Appointment } from '@/lib/mock-data'

const START_HOUR = 8
const END_HOUR = 20
const HOUR_PX = 64

const statusBlock: Record<string, string> = {
  confirmed: 'bg-primary-50 border-primary-300 text-primary-900',
  pending: 'bg-amber-50 border-amber-300 text-amber-900',
  completed: 'bg-stone-100 border-stone-300 text-stone-600',
  cancelled: 'bg-rose-50 border-rose-300 text-rose-700 line-through opacity-70',
}

const statusBar: Record<string, string> = {
  confirmed: 'bg-primary-500',
  pending: 'bg-amber-400',
  completed: 'bg-stone-400',
  cancelled: 'bg-rose-400',
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function DayCalendar({ appointments }: { appointments: Appointment[] }) {
  const therapists = Array.from(new Set(appointments.map((a) => a.therapist)))
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const gridStart = START_HOUR * 60
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_PX

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-xs">
      <div className="min-w-[640px]">
        {/* En-tête colonnes thérapeutes */}
        <div className="flex border-b border-stone-200">
          <div className="w-16 shrink-0 border-r border-stone-200" />
          {therapists.map((t) => (
            <div
              key={t}
              className="flex flex-1 items-center gap-2 border-r border-stone-200 px-4 py-3 last:border-r-0"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                {t
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="text-sm font-medium text-slate-900">{t}</span>
            </div>
          ))}
        </div>

        {/* Grille horaire */}
        <div className="flex">
          {/* Colonne des heures */}
          <div className="w-16 shrink-0 border-r border-stone-200">
            {hours.map((h) => (
              <div
                key={h}
                className="relative text-right"
                style={{ height: h === END_HOUR ? 0 : HOUR_PX }}
              >
                <span className="absolute -top-2 right-2 text-xs text-stone-400">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colonnes thérapeutes */}
          {therapists.map((t) => (
            <div
              key={t}
              className="relative flex-1 border-r border-stone-200 last:border-r-0"
              style={{ height: totalHeight }}
            >
              {/* Lignes horaires */}
              {hours.slice(0, -1).map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-b border-stone-100"
                  style={{ top: (h - START_HOUR) * HOUR_PX, height: HOUR_PX }}
                />
              ))}

              {/* Rendez-vous */}
              {appointments
                .filter((a) => a.therapist === t)
                .map((a) => {
                  const top = ((timeToMinutes(a.time) - gridStart) / 60) * HOUR_PX
                  const height = (a.duration / 60) * HOUR_PX
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'absolute inset-x-1.5 flex gap-2 overflow-hidden rounded-md border p-2 text-xs',
                        statusBlock[a.status]
                      )}
                      style={{ top: top + 2, height: height - 4 }}
                    >
                      <span className={cn('w-1 shrink-0 rounded-full', statusBar[a.status])} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{a.client}</p>
                        <p className="truncate opacity-80">{a.service}</p>
                        <p className="opacity-60">
                          {a.time} · {a.duration} min
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
