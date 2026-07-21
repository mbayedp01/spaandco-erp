'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createStaffAction, updateStaffAction, deleteStaffAction } from '@/app/actions/staff'
import type { Database } from '@/lib/supabase/types'

type StaffMember = Database['public']['Tables']['staff']['Row']

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function StaffForm({ member, onClose }: { member?: StaffMember; onClose: () => void }) {
  const [error, setError]   = useState('')
  const [rating, setRating] = useState(member?.rating ?? 0)
  const [pending, startTransition] = useTransition()
  const isEdit = !!member

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('rating', String(rating || ''))
    startTransition(async () => {
      const result = isEdit
        ? await updateStaffAction(member.id, fd)
        : await createStaffAction(fd)
      if (result.error) { setError(result.error); return }
      if (!isEdit) { (e.target as HTMLFormElement).reset(); setRating(0) }
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Prénom *</label>
          <input name="first_name" required defaultValue={member?.first_name} className={inputCls} placeholder="Awa" />
        </div>
        <div>
          <label className={labelCls}>Nom *</label>
          <input name="last_name" required defaultValue={member?.last_name} className={inputCls} placeholder="Sow" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" defaultValue={member?.email ?? ''} className={inputCls} placeholder="awa.sow@spaandco.sn" />
        </div>
        <div>
          <label className={labelCls}>Téléphone</label>
          <input name="phone" defaultValue={''} className={inputCls} placeholder="+221 77 000 00 00" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Rôle *</label>
          <select name="role" required defaultValue={member?.role ?? 'Thérapeute'} className={inputCls}>
            <option value="Thérapeute">Thérapeute</option>
            <option value="Esthéticienne">Esthéticienne</option>
            <option value="Réceptionniste">Réceptionniste</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Salaire (F)</label>
          <input name="salary" type="number" defaultValue={member?.salary ?? ''} className={inputCls} placeholder="250000" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Spécialité</label>
        <input name="specialty" defaultValue={member?.specialty ?? ''} className={inputCls} placeholder="Massages corps & pierres" />
      </div>

      {isEdit && (
        <div>
          <label className={labelCls}>Statut</label>
          <select name="status" defaultValue={member.status} className={inputCls}>
            <option value="active">Actif</option>
            <option value="absent">Absent</option>
            <option value="conge">En congé</option>
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>Évaluation</label>
        <div className="flex items-center gap-1 pt-1">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n === rating ? 0 : n)}
              className="cursor-pointer"
            >
              <Star className={`h-5 w-5 transition-colors ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
            </button>
          ))}
          {rating > 0 && <span className="ml-1 text-xs text-stone-400">{rating}/5</span>}
        </div>
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

export function AddStaffButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
        <Plus className="h-4 w-4" />
        Ajouter
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau membre du personnel">
        <StaffForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function EditStaffButton({ member }: { member: StaffMember }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le membre">
        <StaffForm member={member} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function DeleteStaffButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer ce membre du personnel ?')) return
    startTransition(async () => { await deleteStaffAction(id) })
  }
  return (
    <button onClick={handleDelete} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40" title="Supprimer">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
