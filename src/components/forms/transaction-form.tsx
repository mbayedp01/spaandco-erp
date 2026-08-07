'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, Search, X, ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { addTransactionAction } from '@/app/actions/cash'
import { InvoiceModal } from '@/components/receipts/print-receipt'
import type { ReceiptEstablishment } from '@/components/receipts/print-receipt'

export type ClientItem    = { id: string; first_name: string; last_name: string; phone?: string | null }
export type ServiceItem   = { id: string; name: string; category: string | null; price: number | null; duration: number | null }
export type ProductItem   = { id: string; name: string; unit_price: number; unit: string | null; quantity: number }

type Mode = 'prestation' | 'produit' | 'libre'
interface CartLine { service: ServiceItem; qty: number }

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

// ─── Client / product combobox ─────────────────────────────────────────────────

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

  function pick(item: T) { setQ(item.name); onSelect(item); setOpen(false) }
  function clear() { setQ(''); onSelect(null) }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text" value={q}
          onChange={e => { setQ(e.target.value); onSelect(null); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-stone-200 pl-8 pr-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={placeholder} autoComplete="off"
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

// ─── Multi-service picker ──────────────────────────────────────────────────────

function ServicePicker({ services, cart, onAdd }: {
  services: ServiceItem[]
  cart: CartLine[]
  onAdd: (s: ServiceItem) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const closeTimer        = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtered = services
    .filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.category ?? '').toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 9)

  function scheduleClose() { closeTimer.current = setTimeout(() => setOpen(false), 150) }
  function cancelClose()   { if (closeTimer.current) clearTimeout(closeTimer.current) }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { cancelClose(); setOpen(true) }}
          onBlur={scheduleClose}
          className="w-full rounded-md border border-stone-200 pl-8 pr-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Ajouter une prestation…" autoComplete="off"
        />
      </div>
      {open && (
        <ul className="absolute z-[60] mt-1 max-h-64 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? filtered.map(s => {
            const already = cart.some(l => l.service.id === s.id)
            return (
              <li key={s.id}>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); cancelClose(); onAdd(s); setQuery(''); setOpen(false) }}
                  className="w-full px-3 py-2 text-left hover:bg-primary-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{s.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {already && <span className="text-[10px] text-primary-600 font-medium">+ déjà</span>}
                      {s.price != null && (
                        <span className="text-xs font-semibold text-primary-700">{s.price.toLocaleString('fr-FR')} F</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    {s.category && <span>{s.category}</span>}
                    {s.duration && <span>· {s.duration} min</span>}
                  </div>
                </button>
              </li>
            )
          }) : (
            <li className="px-3 py-2 text-xs text-stone-400">Aucune prestation trouvée</li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Transaction form ─────────────────────────────────────────────────────────

interface SavedTx {
  label: string; amount: number; type: string
  payment_method: string; category: string; client_name: string; date: string
}

function TransactionForm({
  clients, services, products, onClose, onSaved, defaultType = 'recette',
}: {
  clients: ClientItem[]
  services: ServiceItem[]
  products: ProductItem[]
  onClose: () => void
  onSaved: (tx: SavedTx) => void
  defaultType?: 'recette' | 'charge'
}) {
  const [mode, setMode]           = useState<Mode>(defaultType === 'charge' ? 'libre' : 'prestation')
  const [clientName, setClientName] = useState('')
  const [label, setLabel]         = useState('')
  const [amount, setAmount]       = useState('')
  const [category, setCategory]   = useState(defaultType === 'charge' ? 'Charges' : 'Soins')
  const [prodQty, setProdQty]     = useState(1)
  const [payMethod, setPayMethod] = useState('Cash')
  const [txType, setTxType]       = useState<'recette' | 'charge'>(defaultType)
  const [error, setError]         = useState('')
  const [pending, start]          = useTransition()

  const [cart, setCart] = useState<CartLine[]>([])
  const cartTotal = cart.reduce((s, l) => s + (l.service.price ?? 0) * l.qty, 0)
  const cartLabel = cart.map(l => l.qty > 1 ? `${l.service.name} ×${l.qty}` : l.service.name).join(' + ')

  function addToCart(s: ServiceItem) {
    setCart(prev => {
      const i = prev.findIndex(l => l.service.id === s.id)
      if (i >= 0) { const n = [...prev]; n[i] = { ...n[i], qty: n[i].qty + 1 }; return n }
      return [...prev, { service: s, qty: 1 }]
    })
    if (cart.length === 0) setCategory(s.category ?? 'Soins')
  }
  function removeFromCart(id: string) { setCart(prev => prev.filter(l => l.service.id !== id)) }
  function setCartQty(id: string, q: number) {
    if (q <= 0) return removeFromCart(id)
    setCart(prev => prev.map(l => l.service.id === id ? { ...l, qty: q } : l))
  }

  function pickProduct(p: ProductItem | null) {
    if (!p) { setLabel(''); setAmount(''); return }
    setLabel(p.name); setAmount(String(p.unit_price)); setCategory('Stock')
  }

  const totalAmount = mode === 'produit'
    ? prodQty * (Number(amount) || 0)
    : mode === 'prestation'
    ? cartTotal
    : Number(amount) || 0

  const finalLabel = mode === 'prestation' ? cartLabel : label
  const fullLabel  = clientName ? `${clientName} — ${finalLabel || '—'}` : (finalLabel || '')

  function switchMode(m: Mode) {
    setMode(m)
    setLabel(''); setAmount('')
    setCart([])
    setCategory(m === 'produit' ? 'Stock' : m === 'libre' ? 'Divers' : 'Soins')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'prestation' && cart.length === 0) { setError('Ajoutez au moins une prestation.'); return }
    if (mode !== 'prestation' && !label.trim()) { setError('Veuillez sélectionner ou saisir une désignation.'); return }
    if (!totalAmount) { setError('Le montant est requis.'); return }

    const fd = new FormData()
    fd.set('label',          fullLabel)
    fd.set('amount',         String(totalAmount))
    fd.set('type',           txType)
    fd.set('payment_method', payMethod)
    fd.set('category',       category)

    start(async () => {
      const result = await addTransactionAction(fd)
      if (result.error) { setError(result.error); return }
      onSaved({ label: fullLabel, amount: totalAmount, type: txType, payment_method: payMethod, category, client_name: clientName, date: new Date().toISOString().split('T')[0] })
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
          <button key={m.key} type="button" onClick={() => switchMode(m.key)}
            className={`flex-1 py-2 font-medium transition-colors cursor-pointer ${mode === m.key ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Client */}
      <div>
        <label className={labelCls}>Client (optionnel)</label>
        <Combobox<{ id: string; name: string; phone?: string | null }>
          items={clients.map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}`, phone: c.phone }))}
          placeholder="Rechercher un client…"
          onSelect={c => setClientName(c ? c.name : '')}
          renderSub={c => c.phone ?? ''}
        />
      </div>

      {/* Prestations (multi) */}
      {mode === 'prestation' && (
        <div>
          <label className={labelCls}>Prestations *</label>
          <ServicePicker services={services} cart={cart} onAdd={addToCart} />
          {cart.length > 0 && (
            <ul className="mt-2 space-y-1.5 rounded-md border border-stone-100 bg-stone-50 p-2">
              {cart.map(({ service: svc, qty }) => (
                <li key={svc.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate font-medium text-slate-800">{svc.name}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setCartQty(svc.id, qty - 1)}
                      className="h-5 w-5 rounded border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 flex items-center justify-center text-xs cursor-pointer">−</button>
                    <span className="w-4 text-center text-xs font-semibold">{qty}</span>
                    <button type="button" onClick={() => setCartQty(svc.id, qty + 1)}
                      className="h-5 w-5 rounded border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 flex items-center justify-center text-xs cursor-pointer">+</button>
                  </div>
                  {svc.price != null && (
                    <span className="w-20 shrink-0 text-right text-xs font-semibold text-primary-700">
                      {(svc.price * qty).toLocaleString('fr-FR')} F
                    </span>
                  )}
                  <button type="button" onClick={() => removeFromCart(svc.id)}
                    className="shrink-0 text-stone-300 hover:text-rose-500 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              <li className="mt-1.5 flex items-center justify-between border-t border-stone-200 pt-1.5">
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <ShoppingBag className="h-3 w-3" />
                  {cart.reduce((s, l) => s + l.qty, 0)} prestation{cart.reduce((s, l) => s + l.qty, 0) > 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold text-primary-700">{cartTotal.toLocaleString('fr-FR')} F</span>
              </li>
            </ul>
          )}
        </div>
      )}

      {/* Produit */}
      {mode === 'produit' && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Produit *</label>
            <Combobox<ProductItem>
              items={products} placeholder="Rechercher un produit…" onSelect={pickProduct}
              renderSub={p => `${p.unit_price.toLocaleString('fr-FR')} F${p.unit ? ' / ' + p.unit : ''} · Stock: ${p.quantity}`}
            />
          </div>
          <div>
            <label className={labelCls}>Quantité</label>
            <input type="number" min="1" value={prodQty} onChange={e => setProdQty(Math.max(1, Number(e.target.value)))} className={inputCls} />
          </div>
        </div>
      )}

      {/* Désignation — produit et libre seulement */}
      {mode !== 'prestation' && (
        <div>
          <label className={labelCls}>Désignation {mode === 'libre' ? '*' : '(auto-remplie)'}</label>
          <input value={label} onChange={e => setLabel(e.target.value)} required={mode === 'libre'} className={inputCls}
            placeholder={mode === 'produit' ? 'Sélectionnez un produit ci-dessus' : 'Ex: Massage détente'} />
        </div>
      )}

      {/* Prix + type */}
      <div className="grid grid-cols-2 gap-3">
        {mode !== 'prestation' && (
          <div>
            <label className={labelCls}>Prix unitaire (F) *</label>
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="0" />
          </div>
        )}
        {mode === 'produit' && (
          <div>
            <label className={labelCls}>Total</label>
            <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-slate-900">
              {totalAmount.toLocaleString('fr-FR')} F
            </div>
          </div>
        )}
        {mode !== 'produit' && (
          <div className={mode === 'prestation' ? 'col-span-2' : ''}>
            <label className={labelCls}>Type</label>
            <select value={txType} onChange={e => setTxType(e.target.value as 'recette' | 'charge')} className={inputCls}>
              <option value="recette">Recette</option>
              <option value="charge">Charge</option>
            </select>
          </div>
        )}
      </div>

      {/* Paiement + catégorie */}
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
        <button type="button" onClick={onClose}
          className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending}
          className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

function TransactionButton({
  clients, services, products, establishment, defaultType, label: btnLabel, className,
}: {
  clients: ClientItem[]
  services: ServiceItem[]
  products: ProductItem[]
  establishment: ReceiptEstablishment
  defaultType?: 'recette' | 'charge'
  label: string
  className: string
}) {
  const [open, setOpen]   = useState(false)
  const [saved, setSaved] = useState<SavedTx | null>(null)

  function handleSaved(tx: SavedTx) { setOpen(false); setSaved(tx) }

  const title = defaultType === 'charge' ? 'Nouvelle dépense' : 'Nouvelle écriture'

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        <Plus className="h-4 w-4" />
        {btnLabel}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <TransactionForm
          clients={clients} services={services} products={products}
          onClose={() => setOpen(false)} onSaved={handleSaved}
          defaultType={defaultType}
        />
      </Modal>

      {saved && (
        <InvoiceModal
          transaction={{ id: 'new-' + Date.now(), label: saved.label, category: saved.category, amount: saved.amount, type: saved.type, payment_method: saved.payment_method, date: saved.date }}
          establishment={establishment}
          clientName={saved.client_name}
          onClose={() => setSaved(null)}
        />
      )}
    </>
  )
}

export function AddTransactionButton({
  clients = [], services = [], products = [], establishment,
}: {
  clients?: ClientItem[]
  services?: ServiceItem[]
  products?: ProductItem[]
  establishment?: ReceiptEstablishment
}) {
  const spa = establishment ?? { name: 'Spa and Co', city: 'Dakar', address: null, phone: null }
  return (
    <TransactionButton
      clients={clients} services={services} products={products} establishment={spa}
      label="Ajouter"
      className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
    />
  )
}

export function AddExpenseButton({
  clients = [], establishment,
}: {
  clients?: ClientItem[]
  establishment?: ReceiptEstablishment
}) {
  const spa = establishment ?? { name: 'Spa and Co', city: 'Dakar', address: null, phone: null }
  return (
    <TransactionButton
      clients={clients} services={[]} products={[]} establishment={spa}
      defaultType="charge"
      label="Dépense"
      className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
    />
  )
}
