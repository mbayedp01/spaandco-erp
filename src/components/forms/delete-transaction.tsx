'use client'

import { useState, useTransition } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { deleteTransactionAction } from '@/app/actions/cash'

interface Props {
  transactionId: string
  label: string
  amount: number
}

export function DeleteTransactionButton({ transactionId, label, amount }: Props) {
  const [open, setOpen]     = useState(false)
  const [error, setError]   = useState('')
  const [pending, start]    = useTransition()

  function confirmDelete() {
    setError('')
    start(async () => {
      const res = await deleteTransactionAction(transactionId)
      if (res.error) { setError(res.error); return }
      setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(''); setOpen(true) }}
        className="shrink-0 rounded-md p-1.5 text-stone-300 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors"
        title="Supprimer la transaction"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer la transaction">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Voulez-vous vraiment supprimer cette transaction ? Cette action est <strong>irréversible</strong>.
          </p>
          <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-900">{label}</p>
            <p className="text-stone-500">{amount.toLocaleString('fr-FR')} F</p>
          </div>

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              <X className="h-3.5 w-3.5" /> Annuler
            </button>
            <button type="button" onClick={confirmDelete} disabled={pending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 cursor-pointer">
              <Check className="h-3.5 w-3.5" />
              {pending ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
