'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createServiceAction, updateServiceAction } from '@/app/actions/services'
import type { Database } from '@/lib/supabase/types'

type Service = Database['public']['Tables']['services']['Row']

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

const CATEGORIES = ['Massages', 'Soins visage', 'Soins corps', 'Beauté']

interface Props {
  service?: Service
  onClose?: () => void
}

function ServiceFormContent({ service, onClose }: Props) {
  const [active, setActive]   = useState(service?.active ?? true)
  const [error, setError]     = useState('')
  const [pending, startTransition] = useTransition()
  const isEdit = !!service

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('active', String(active))
    startTransition(async () => {
      const result = isEdit
        ? await updateServiceAction(service.id, fd)
        : await createServiceAction(fd)
      if (result.error) { setError(result.error); return }
      if (!isEdit) (e.target as HTMLFormElement).reset()
      onClose?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Nom de la prestation *</label>
        <input name="name" required defaultValue={service?.name} className={inputCls} placeholder="Ex : Massage relaxant 60 min" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Catégorie *</label>
          <select name="category" required defaultValue={service?.category ?? ''} className={inputCls}>
            <option value="" disabled>Choisir…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <button
            type="button"
            onClick={() => setActive(v => !v)}
            className={`w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${active ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-50 text-stone-500'}`}
          >
            {active ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Durée (min) *</label>
          <input name="duration" type="number" min="5" step="5" required defaultValue={service?.duration ?? 60} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Prix (F) *</label>
          <input name="price" type="number" min="0" required defaultValue={service?.price ?? 0} className={inputCls} placeholder="25000" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" rows={3} defaultValue={service?.description ?? ''} className={inputCls} placeholder="Description de la prestation…" />
      </div>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

export function AddServiceButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Nouvelle prestation
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle prestation">
        <ServiceFormContent onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function EditServiceButton({ service }: { service: Service }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors"
        title="Modifier"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier la prestation">
        <ServiceFormContent service={service} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}
