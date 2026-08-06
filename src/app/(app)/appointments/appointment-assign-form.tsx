'use client'

import { useState, useTransition } from 'react'
import { UserCheck, Clock, Check } from 'lucide-react'
import { assignAndConfirmAppointmentAction } from '@/app/actions/appointments'
import { cn } from '@/lib/utils'

interface Props {
  appointmentId: string
  staffNames: string[]
}

export function AppointmentAssignForm({ appointmentId, staffNames }: Props) {
  const [open,      setOpen]   = useState(false)
  const [staff,     setStaff]  = useState('')
  const [time,      setTime]   = useState('')
  const [error,     setError]  = useState<string | null>(null)
  const [pending,   startTx]   = useTransition()

  function submit() {
    setError(null)
    startTx(async () => {
      const res = await assignAndConfirmAppointmentAction(appointmentId, staff, time)
      if (res.error) { setError(res.error); return }
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer"
      >
        <UserCheck className="h-3 w-3" />
        Assigner
      </button>
    )
  }

  return (
    <div className="mt-3 w-full rounded-lg border border-primary-200 bg-primary-50/50 p-3 space-y-2">
      <p className="text-xs font-semibold text-primary-700">Assigner &amp; Confirmer</p>

      <div className="flex flex-wrap gap-2">
        <select
          value={staff}
          onChange={e => setStaff(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="">— Thérapeute —</option>
          {staffNames.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-[110px] rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={pending || !staff || !time}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
            'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Check className="h-3 w-3" />
          {pending ? 'Enregistrement…' : 'Confirmer'}
        </button>
        <button
          onClick={() => { setOpen(false); setError(null) }}
          className="rounded-md px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
