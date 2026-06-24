'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createStaffAction } from '@/app/actions/staff'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

export function AddStaffButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createStaffAction(fd)
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau membre du personnel">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Prénom *</label>
              <input name="first_name" required className={inputCls} placeholder="Awa" />
            </div>
            <div>
              <label className={labelCls}>Nom *</label>
              <input name="last_name" required className={inputCls} placeholder="Sow" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input name="email" type="email" className={inputCls} placeholder="awa.sow@spaandco.sn" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Rôle *</label>
              <select name="role" required className={inputCls}>
                <option value="Thérapeute">Thérapeute</option>
                <option value="Esthéticienne">Esthéticienne</option>
                <option value="Réceptionniste">Réceptionniste</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Salaire (F)</label>
              <input name="salary" type="number" className={inputCls} placeholder="250000" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Spécialité</label>
            <input name="specialty" className={inputCls} placeholder="Massages corps & pierres" />
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
