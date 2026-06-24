'use client'

import { useTransition } from 'react'
import { updateAppointmentStatusAction } from '@/app/actions/appointments'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  currentStatus: string
}

export function AppointmentStatusButtons({ id, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function update(status: string) {
    startTransition(() => updateAppointmentStatusAction(id, status))
  }

  if (currentStatus === 'completed' || currentStatus === 'cancelled') return null

  return (
    <div className="flex shrink-0 gap-1">
      {currentStatus === 'pending' && (
        <button
          onClick={() => update('confirmed')}
          disabled={pending}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
            'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50'
          )}
        >
          Confirmer
        </button>
      )}
      {currentStatus !== 'cancelled' && (
        <button
          onClick={() => update('completed')}
          disabled={pending}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
            'bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-50'
          )}
        >
          Terminer
        </button>
      )}
      <button
        onClick={() => update('cancelled')}
        disabled={pending}
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer',
          'bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50'
        )}
      >
        Annuler
      </button>
    </div>
  )
}
