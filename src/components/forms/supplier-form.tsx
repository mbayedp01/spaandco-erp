'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/app/actions/suppliers'
import type { Database } from '@/lib/supabase/types'

type Supplier = Database['public']['Tables']['suppliers']['Row']

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function SupplierForm({ supplier, onClose }: { supplier?: Supplier; onClose: () => void }) {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = supplier
        ? await updateSupplierAction(supplier.id, fd)
        : await createSupplierAction(fd)
      if (result.error) { setError(result.error); return }
      if (!supplier) (e.target as HTMLFormElement).reset()
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Nom *</label>
        <input name="name" required defaultValue={supplier?.name} className={inputCls} placeholder="NaturaBio SN" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Catégorie</label>
          <input name="category" defaultValue={supplier?.category ?? ''} className={inputCls} placeholder="Huiles & Produits naturels" />
        </div>
        <div>
          <label className={labelCls}>Contact</label>
          <input name="contact" defaultValue={supplier?.contact ?? ''} className={inputCls} placeholder="Fatou Diallo" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Téléphone</label>
          <input name="phone" defaultValue={supplier?.phone ?? ''} className={inputCls} placeholder="+221 77 100 10 01" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" defaultValue={supplier?.email ?? ''} className={inputCls} placeholder="contact@fournisseur.sn" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Dépense mensuelle (F)</label>
          <input name="monthly_spend" type="number" min="0" defaultValue={supplier?.monthly_spend ?? 0} className={inputCls} />
        </div>
        {supplier && (
          <div>
            <label className={labelCls}>Statut</label>
            <select name="status" defaultValue={supplier.status} className={inputCls}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        )}
      </div>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : supplier ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

export function AddSupplierButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
        <Plus className="h-4 w-4" />
        Ajouter
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau fournisseur">
        <SupplierForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function EditSupplierButton({ supplier }: { supplier: Supplier }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le fournisseur">
        <SupplierForm supplier={supplier} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function DeleteSupplierButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer ce fournisseur ?')) return
    startTransition(async () => { await deleteSupplierAction(id) })
  }
  return (
    <button onClick={handleDelete} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40" title="Supprimer">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
