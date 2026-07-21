'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createInventoryAction, updateInventoryAction, deleteInventoryAction } from '@/app/actions/inventory'
import type { Database } from '@/lib/supabase/types'

type InventoryItem = Database['public']['Tables']['inventory']['Row']
export type SupplierItem = { id: string; name: string }

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function SupplierCombobox({ suppliers, defaultValue }: { suppliers: SupplierItem[]; defaultValue?: string }) {
  const [value, setValue]   = useState(defaultValue ?? '')
  const [open, setOpen]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = value.length >= 1
    ? suppliers.filter(s => s.name.toLowerCase().includes(value.toLowerCase())).slice(0, 7)
    : suppliers.slice(0, 7)

  if (suppliers.length === 0) {
    return (
      <input
        name="supplier"
        value={value}
        onChange={e => setValue(e.target.value)}
        className={inputCls}
        placeholder="Nom du fournisseur"
      />
    )
  }

  return (
    <div ref={ref} className="relative">
      <input
        name="supplier"
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={inputCls}
        placeholder="Rechercher un fournisseur…"
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map(s => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={() => { setValue(s.name); setOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-primary-50 hover:text-primary-700"
                >
                  {s.name}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-stone-400">
              Nouveau fournisseur : <span className="font-medium text-slate-700">«{value}»</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function InventoryForm({ item, suppliers, onClose }: { item?: InventoryItem; suppliers: SupplierItem[]; onClose: () => void }) {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = item
        ? await updateInventoryAction(item.id, fd)
        : await createInventoryAction(fd)
      if (result.error) { setError(result.error); return }
      if (!item) (e.target as HTMLFormElement).reset()
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Nom du produit *</label>
        <input name="name" required defaultValue={item?.name} className={inputCls} placeholder="Huile de massage argan" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Catégorie</label>
          <select name="category" defaultValue={item?.category ?? 'Huiles'} className={inputCls}>
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
          <input name="unit" defaultValue={item?.unit ?? ''} className={inputCls} placeholder="bouteille" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Quantité *</label>
          <input name="quantity" type="number" min="0" required defaultValue={item?.quantity ?? 0} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Qté min</label>
          <input name="min_quantity" type="number" min="0" defaultValue={item?.min_quantity ?? 5} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Prix unitaire (F)</label>
          <input name="unit_price" type="number" min="0" defaultValue={item?.unit_price ?? ''} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Fournisseur</label>
        <SupplierCombobox suppliers={suppliers} defaultValue={item?.supplier ?? ''} />
      </div>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : item ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export function AddInventoryButton({ suppliers = [] }: { suppliers?: SupplierItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
        <Plus className="h-4 w-4" />
        Ajouter
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau produit">
        <InventoryForm suppliers={suppliers} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function EditInventoryButton({ item, suppliers = [] }: { item: InventoryItem; suppliers?: SupplierItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le produit">
        <InventoryForm item={item} suppliers={suppliers} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function DeleteInventoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer ce produit du stock ?')) return
    startTransition(async () => { await deleteInventoryAction(id) })
  }
  return (
    <button onClick={handleDelete} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40" title="Supprimer">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
