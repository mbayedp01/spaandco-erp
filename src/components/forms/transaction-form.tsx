'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { addTransactionAction } from '@/app/actions/cash'
import { InvoiceModal } from '@/components/receipts/print-receipt'
import type { ReceiptEstablishment } from '@/components/receipts/print-receipt'

export type ClientItem    = { id: string; first_name: string; last_name: string; phone?: string | null }
export type ServiceItem   = { id: string; name: string; category: string | null; price: number | null; duration: number | null }
export type ProductItem   = { id: string; name: string; unit_price: number; unit: string | null; quantity: number }

type Mode = 'prestation' | 'produit' | 'libre'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

// ─── Generic combobox ─────────────────────────────────────────────────────────

function Combobox<T extends { id: string; name: string }>({
  items, placeholder, onSelect, renderSub,
}: {
  items: T[]
  placeholder: string
  onSelect: (item: T | null) => void
  renderSub?: (item: T) => string
}) {
  const [q, setQ]       = useState('')
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = items.filter(i => i.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)

  function pick(item: T) {
    setQ(item.name)
    onSelect(item)
    setOpen(false)
  }

  function clear() {
    setQ('')
    onSelect(null)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); onSelect(null); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-stone-200 pl-8 pr-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={placeholder}
          autoComplete="off"
        />
        {q && (
          <button type="button" onClick={clear} className="absolute right-2.5 top-2 text-stone-300 hover:text-stone-500 text-lg leading-none">×</button>
        )}
      </div>
      {open && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? filtered.map(item => (
            <li key={item.id}>
              <button type="button" onMouseDown={() => pick(item)} className="w-full px-3 py-2 text-left hover:bg-primary-50">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                {renderSub && <p className="text-xs text-stone-400">{renderSub(item)}</p>}
              </button>
            </li>
          )) : (
            <li className="px-3 py-2 text-xs text-stone-400">Aucun résultat</li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Transaction form ─────────────────────────────────────────────────────────

interface SavedTx {
  label: string
  amount: number
  type: string
  payment_method: string
  category: string
  client_name: string
  date: string
}

function TransactionForm({
  clients, services, products, onClose, onSaved,
}: {
  clients: ClientItem[]
  services: ServiceItem[]
  products: ProductItem[]
  onClose: () => void
  onSaved: (tx: SavedTx) => void
}) {
  const [mode, setMode]             = useState<Mode>('prestation')
  const [clientName, setClientName] = useState('')
  const [label, setLabel]           = useState('')
  const [amount, setAmount]         = useState('')
  const [category, setCategory]     = useState('Soins')
  const [qty, setQty]               = useState(1)
  const [payMethod, setPayMethod]   = useState('Cash')
  const [txType, setTxType]         = useState<'recette' | 'charge'>('recette')
  const [error, setError]           = useState('')
  const [pending, start]            = useTransition()

  function pickService(s: ServiceItem | null) {
    if (!s) { setLabel(''); setAmount(''); return }
    setLabel(s.name)
    setAmount(s.price != null ? String(s.price) : '')
    setCategory(s.category ?? 'Soins')
  }

  function pickProduct(p: ProductItem | null) {
    if (!p) { setLabel(''); setAmount(''); return }
    setLabel(p.name)
    setAmount(String(p.unit_price))
    setCategory('Stock')
  }

  const totalAmount = mode === 'produit' ? qty * (Number(amount) || 0) : Number(amount) || 0
  const fullLabel   = clientName ? `${clientName} — ${label || '—'}` : (label || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!label.trim()) { setError('Veuillez sélectionner ou saisir une désignation.'); return }
    if (!totalAmount)  { setError('Le montant est requis.'); return }

    const fd = new FormData()
    fd.set('label',          fullLabel)
    fd.set('amount',         String(totalAmount))
    fd.set('type',           txType)
    fd.set('payment_method', payMethod)
    fd.set('category',       category)

    start(async () => {
      const result = await addTransactionAction(fd)
      if (result.error) { setError(result.error); return }
      onSaved({
        label:          fullLabel,
        amount:         totalAmount,
        type:           txType,
        payment_method: payMethod,
        category,
        client_name:    clientName,
        date:           new Date().toISOString().split('T')[0],
      })
    })
  }

  const MODES: { key: Mode; label: string }[] = [
    { key: 'prestation', label: 'Prestation' },
    { key: 'produit',    label: 'Produit' },
    { key: 'libre',      label: 'Écriture libre' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-stone-200 overflow-hidden text-sm">
        {MODES.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => { setMode(m.key); setLabel(''); setAmount(''); setCategory(m.key === 'produit' ? 'Stock' : 'Soins') }}
            className={`flex-1 py-2 font-medium transition-colors cursor-pointer ${mode === m.key ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Client (toujours visible) */}
      <div>
        <label className={labelCls}>Client (optionnel)</label>
        <Combobox<{ id: string; name: string; phone?: string | null }>
          items={clients.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}`, phone: c.phone }))}
          placeholder="Rechercher un client…"
          onSelect={c => setClientName(c ? c.name : '')}
          renderSub={c => c.phone ?? ''}
        />
      </div>

      {/* Prestation */}
      {mode === 'prestation' && (
        <div>
          <label className={labelCls}>Prestation *</label>
          <Combobox<ServiceItem>
            items={services}
            placeholder="Rechercher une prestation…"
            onSelect={pickService}
            renderSub={s => [s.category, s.duration ? `${s.duration} min` : null, s.price ? `${s.price.toLocaleString('fr-FR')} F` : null].filter(Boolean).join(' · ')}
          />
        </div>
      )}

      {/* Produit */}
      {mode === 'produit' && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Produit *</label>
            <Combobox<ProductItem>
              items={products}
              placeholder="Rechercher un produit…"
              onSelect={pickProduct}
              renderSub={p => `${p.unit_price.toLocaleString('fr-FR')} F${p.unit ? ' / ' + p.unit : ''} · Stock: ${p.quantity}`}
            />
          </div>
          <div>
            <label className={labelCls}>Quantité</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} className={inputCls} />
          </div>
        </div>
      )}

      {/* Libre ou overrides */}
      <div>
        <label className={labelCls}>Désignation {mode !== 'libre' ? '(auto-remplie)' : '*'}</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          required={mode === 'libre'}
          className={inputCls}
          placeholder={mode === 'prestation' ? 'Sélectionnez une prestation ci-dessus' : mode === 'produit' ? 'Sélectionnez un produit ci-dessus' : 'Ex: Massage détente'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Prix unitaire (F) *</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </div>
        {mode === 'produit' && (
          <div>
            <label className={labelCls}>Total</label>
            <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-slate-900">
              {totalAmount.toLocaleString('fr-FR')} F
            </div>
          </div>
        )}
        {mode !== 'produit' && (
          <div>
            <label className={labelCls}>Type</label>
            <select value={txType} onChange={e => setTxType(e.target.value as 'recette' | 'charge')} className={inputCls}>
              <option value="recette">Recette</option>
              <option value="charge">Charge</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Mode de paiement</label>
          <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className={inputCls}>
            <option value="Cash">Cash</option>
            <option value="Wave">Wave</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Carte">Carte</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Virement">Virement</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Catégorie</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            <option value="Soins">Soins</option>
            <option value="Beauté">Beauté</option>
            <option value="Abonnements">Abonnements</option>
            <option value="Stock">Stock</option>
            <option value="Charges">Charges</option>
            <option value="Divers">Divers</option>
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

// ─── Export ───────────────────────────────────────────────────────────────────

export function AddTransactionButton({
  clients = [], services = [], products = [], establishment,
}: {
  clients?: ClientItem[]
  services?: ServiceItem[]
  products?: ProductItem[]
  establishment?: ReceiptEstablishment
}) {
  const [open, setOpen]       = useState(false)
  const [saved, setSaved]     = useState<SavedTx | null>(null)

  const spa = establishment ?? { name: 'Spa and Co', city: 'Dakar', address: null, phone: null }

  function handleSaved(tx: SavedTx) {
    setOpen(false)
    setSaved(tx)
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
        <TransactionForm
          clients={clients}
          services={services}
          products={products}
          onClose={() => setOpen(false)}
          onSaved={handleSaved}
        />
      </Modal>

      {saved && (
        <InvoiceModal
          transaction={{ id: 'new-' + Date.now(), label: saved.label, category: saved.category, amount: saved.amount, type: saved.type, payment_method: saved.payment_method, date: saved.date }}
          establishment={spa}
          clientName={saved.client_name}
          onClose={() => setSaved(null)}
        />
      )}
    </>
  )
}
