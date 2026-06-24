'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createSupplierAction } from '@/app/actions/suppliers'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

export function AddSupplierButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createSupplierAction(fd)
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau fournisseur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nom *</label>
            <input name="name" required className={inputCls} placeholder="NaturaBio SN" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Catégorie</label>
              <input name="category" className={inputCls} placeholder="Huiles & Produits naturels" />
            </div>
            <div>
              <label className={labelCls}>Contact</label>
              <input name="contact" className={inputCls} placeholder="Fatou Diallo" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Téléphone</label>
              <input name="phone" className={inputCls} placeholder="+221 77 100 10 01" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input name="email" type="email" className={inputCls} placeholder="contact@fournisseur.sn" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Dépense mensuelle (F)</label>
            <input name="monthly_spend" type="number" min="0" className={inputCls} placeholder="150000" />
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
