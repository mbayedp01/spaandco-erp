'use client'

import { useState, useTransition } from 'react'
import { UserCog, Check } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { setTransactionPerformersAction } from '@/app/actions/cash'

interface Props {
  transactionId: string
  performers: string[]
  staffNames: string[]
}

export function PerformerEditor({ transactionId, performers, staffNames }: Props) {
  const [current, setCurrent] = useState<string[]>(performers)
  const [open, setOpen]       = useState(false)
  const [draft, setDraft]     = useState<string[]>(performers)
  const [error, setError]     = useState('')
  const [pending, start]      = useTransition()

  function openModal() {
    setDraft(current)
    setError('')
    setOpen(true)
  }
  function toggle(name: string) {
    setDraft(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }
  function save() {
    setError('')
    start(async () => {
      const res = await setTransactionPerformersAction(transactionId, draft)
      if (res.error) { setError(res.error); return }
      setCurrent(draft)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mt-0.5 inline-flex items-center gap-1 rounded-md text-xs text-stone-400 hover:text-primary-600 cursor-pointer"
        title="Praticien(s) ayant réalisé la prestation"
      >
        <UserCog className="h-3 w-3 shrink-0" />
        {current.length > 0 ? (
          <span className="font-medium text-stone-500">{current.join(', ')}</span>
        ) : (
          <span className="italic">Ajouter praticien</span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Praticien(s) de la prestation">
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Sélectionnez qui a réalisé la prestation. Vous pouvez en choisir plusieurs, modifier ou tout retirer.
          </p>

          {staffNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {staffNames.map(name => {
                const on = draft.includes(name)
                return (
                  <button
                    key={name} type="button" onClick={() => toggle(name)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      on
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-400">Aucun praticien enregistré pour cet établissement.</p>
          )}

          {draft.length > 1 && (
            <p className="text-[11px] text-stone-400">
              Séance à {draft.length} praticiens — le CA sera réparti entre eux dans les statistiques.
            </p>
          )}

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="button" onClick={save} disabled={pending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              <Check className="h-3.5 w-3.5" />
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
