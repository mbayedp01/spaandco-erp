'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import { updateAppointmentStatusAction } from '@/app/actions/appointments'

interface Props {
  id: string
  currentStatus: string
}

export function MedecinAppointmentActions({ id, currentStatus }: Props) {
  const [open, setOpen]   = useState(false)
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return <span className="text-xs text-stone-400 italic">Terminé</span>
  }

  function confirm() {
    startTransition(async () => {
      await updateAppointmentStatusAction(id, 'completed', notes.trim() || undefined)
      setOpen(false)
      setNotes('')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Terminer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-stone-200" />
            </div>
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Terminer le soin</h3>
                  <p className="text-xs text-stone-400">Ajoutez un commentaire (optionnel)</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MessageSquare className="h-3.5 w-3.5 text-stone-400" />
                Commentaire / Notes de soin
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Ex : client détendu, recommande un suivi dans 2 semaines, zones sensibles notées…"
                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-50"
              />
            </div>

            <div className="flex gap-3 px-5 pb-6">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirm}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer transition-colors"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isPending ? 'Enregistrement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
