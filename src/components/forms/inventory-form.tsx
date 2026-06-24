'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createInventoryAction } from '@/app/actions/inventory'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

export function AddInventoryButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createInventoryAction(fd)
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau produit">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nom du produit *</label>
            <input name="name" required className={inputCls} placeholder="Huile de massage argan" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Catégorie</label>
              <select name="category" className={inputCls}>
                <option value="Huiles">Huiles</option>
                <option value="Soins visage">Soins visage</option>
                <option value="Soins corps">Soins corps</option>
                <option value="Beauté">Beauté</option>
                <option value="Équipement">Équipement</option>
                <option value="Linge">Linge</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Unité</label>
              <input name="unit" className={inputCls} placeholder="bouteille" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Quantité *</label>
              <input name="quantity" type="number" min="0" required className={inputCls} placeholder="10" />
            </div>
            <div>
              <label className={labelCls}>Qté min</label>
              <input name="min_quantity" type="number" min="0" className={inputCls} placeholder="5" />
            </div>
            <div>
              <label className={labelCls}>Prix unitaire (F)</label>
              <input name="unit_price" type="number" min="0" className={inputCls} placeholder="8500" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Fournisseur</label>
            <input name="supplier" className={inputCls} placeholder="NaturaBio SN" />
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
