'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { addTransactionAction } from '@/app/actions/cash'

export type ClientItem = { id: string; first_name: string; last_name: string; phone?: string | null }

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function ClientCombobox({ clients, onSelect }: { clients: ClientItem[]; onSelect: (name: string) => void }) {
  const [value, setValue] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = value.length >= 1
    ? clients.filter(c => {
        const q = value.toLowerCase()
        return `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
          || (c.phone ?? '').includes(q)
      }).slice(0, 8)
    : clients.slice(0, 8)

  function select(c: ClientItem) {
    const fullName = `${c.first_name} ${c.last_name}`
    setValue(fullName)
    onSelect(fullName)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); onSelect(''); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={inputCls}
        placeholder="Rechercher un client…"
        autoComplete="off"
      />
      {open && clients.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={() => select(c)}
                  className="w-full px-3 py-2 text-left hover:bg-primary-50"
                >
                  <p className="text-sm font-medium text-slate-900">{c.first_name} {c.last_name}</p>
                  {c.phone && <p className="text-xs text-stone-400">{c.phone}</p>}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-stone-400">Aucun client trouvé</li>
          )}
        </ul>
      )}
    </div>
  )
}

function TransactionForm({ clients, onClose }: { clients: ClientItem[]; onClose: () => void }) {
  const [label, setLabel]     = useState('')
  const [error, setError]     = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (label) fd.set('label', label)
    startTransition(async () => {
      const result = await addTransactionAction(fd)
      if (result.error) { setError(result.error); return }
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {clients.length > 0 && (
        <div>
          <label className={labelCls}>Client (optionnel)</label>
          <ClientCombobox clients={clients} onSelect={name => setLabel(name ? name : label)} />
        </div>
      )}
      <div>
        <label className={labelCls}>Libellé *</label>
        <input
          name="label"
          required
          value={label}
          onChange={e => setLabel(e.target.value)}
          className={inputCls}
          placeholder="Ex: Cheikh Sarr — Massage détente"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <option value="Cash">Cash</option>
            <option value="Wave">Wave</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Carte">Carte</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Virement">Virement</option>
          </select>
        </div>
      </div>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

export function AddTransactionButton({ clients = [] }: { clients?: ClientItem[] }) {
  const [open, setOpen] = useState(false)
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
        <TransactionForm clients={clients} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}
