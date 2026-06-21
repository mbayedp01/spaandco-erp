import { cn } from '@/lib/utils'
import { appointments, weekDays, TODAY_INDEX, type Appointment } from '@/lib/mock-data'

const START_HOUR = 8
const END_HOUR = 20
const HOUR_PX = 56

const statusBlock: Record<string, string> = {
  confirmed: 'bg-primary-500 text-white',
  pending: 'bg-amber-400 text-amber-950',
  completed: 'bg-stone-400 text-white',
  cancelled: 'bg-rose-400 text-white line-through opacity-80',
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function WeekCalendar() {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const gridStart = START_HOUR * 60
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_PX

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-xs">
      <div className="min-w-[760px]">
        {/* En-tête jours */}
        <div className="flex border-b border-stone-200">
          <div className="w-14 shrink-0 border-r border-stone-200" />
          {weekDays.map((d, i) => {
            const isToday = i === TODAY_INDEX
            return (
              <div
                key={d.short}
                className={cn(
                  'flex flex-1 flex-col items-center border-r border-stone-200 py-2 last:border-r-0',
                  isToday && 'bg-primary-50'
                )}
              >
                <span className={cn('text-xs', isToday ? 'text-primary-700' : 'text-stone-400')}>
                  {d.short}
                </span>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    isToday ? 'bg-primary-600 text-white' : 'text-slate-900'
                  )}
                >
                  {d.date}
                </span>
              </div>
            )
          })}
        </div>

        {/* Grille */}
        <div className="flex">
          {/* Heures */}
          <div className="w-14 shrink-0 border-r border-stone-200">
            {hours.map((h) => (
              <div key={h} className="relative" style={{ height: h === END_HOUR ? 0 : HOUR_PX }}>
                <span className="absolute -top-2 right-1.5 text-[11px] text-stone-400">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Colonnes jours */}
          {weekDays.map((d, dayIdx) => (
            <div
              key={d.short}
              className={cn(
                'relative flex-1 border-r border-stone-200 last:border-r-0',
                dayIdx === TODAY_INDEX && 'bg-primary-50/40'
              )}
              style={{ height: totalHeight }}
            >
              {hours.slice(0, -1).map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-b border-stone-100"
                  style={{ top: (h - START_HOUR) * HOUR_PX, height: HOUR_PX }}
                />
              ))}

              {appointments
                .filter((a: Appointment) => a.day === dayIdx)
                .map((a) => {
                  const top = ((timeToMinutes(a.time) - gridStart) / 60) * HOUR_PX
                  const height = (a.duration / 60) * HOUR_PX
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        'absolute inset-x-0.5 overflow-hidden rounded px-1.5 py-1 text-[11px] leading-tight',
                        statusBlock[a.status]
                      )}
                      style={{ top: top + 1, height: height - 2 }}
                      title={`${a.time} · ${a.client} · ${a.service}`}
                    >
                      <p className="font-semibold">{a.time}</p>
                      <p className="truncate">{a.client}</p>
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
