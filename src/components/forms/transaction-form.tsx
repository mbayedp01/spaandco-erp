'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { addTransactionAction } from '@/app/actions/cash'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

export function AddTransactionButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addTransactionAction(fd)
        setOpen(false)
        ;(e.target as HTMLFormElement).reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Ajouter
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle écriture">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Libellé *</label>
            <input name="label" required className={inputCls} placeholder="Ex: Cheikh Sarr — Massage" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type *</label>
              <select name="type" required className={inputCls}>
                <option value="recette">Recette</option>
                <option value="charge">Charge</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Montant (F) *</label>
              <input name="amount" type="number" min="1" required className={inputCls} placeholder="25000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Catégorie</label>
              <select name="category" className={inputCls}>
                <option value="Soins">Soins</option>
                <option value="Beauté">Beauté</option>
                <option value="Abonnements">Abonnements</option>
                <option value="Stock">Stock</option>
                <option value="Charges">Charges</option>
                <option value="Divers">Divers</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Mode de paiement</label>
              <select name="payment_method" className={inputCls}>
                <option value="Carte">Carte</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Virement">Virement</option>
              </select>
            </div>
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
