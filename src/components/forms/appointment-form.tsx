'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, AlertTriangle, X, ShoppingBag } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createAppointmentAction } from '@/app/actions/appointments'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

export interface ClientItem   { id: string; name: string }
export interface ServiceItem  { id: string; name: string; price: number | null; duration: number | null; category: string | null }
export interface ExistingAppt { date: string | null; time: string | null; staff_name: string | null; duration: number | null }

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function detectConflict(
  date: string, time: string, staffName: string, durationMin: number,
  existing: ExistingAppt[]
): boolean {
  if (!staffName || !date || !time) return false
  const start = timeToMin(time)
  const end   = start + durationMin
  return existing.some((a) => {
    if (!a.date || !a.time) return false
    if (a.date !== date || a.staff_name !== staffName) return false
    const aStart = timeToMin(a.time)
    const aEnd   = aStart + (a.duration ?? 60)
    return start < aEnd && end > aStart
  })
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, cb])
}

// ─── Client combobox ──────────────────────────────────────────────────────────
function ClientCombobox({ clients }: { clients: ClientItem[] }) {
  const [value, setValue] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const filtered = value.length >= 1
    ? clients.filter((c) => c.name.toLowerCase().includes(value.toLowerCase())).slice(0, 7)
    : []

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name="client_name" value={value} />
      <input
        type="text" value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => value.length >= 1 && setOpen(true)}
        className={inputCls} placeholder="Rechercher ou saisir un nom…" autoComplete="off"
      />
      {open && value.length >= 1 && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={(e) => { e.stopPropagation(); setValue(c.name); setOpen(false) }}
                className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-primary-50 hover:text-primary-700">
                {c.name}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-stone-400">
              Nouveau client : <span className="font-medium text-slate-700">«{value}»</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Service picker (multi) ───────────────────────────────────────────────────
interface CartLine { service: ServiceItem; qty: number }

function ServicePicker({
  services,
  cart,
  onAdd,
}: {
  services: ServiceItem[]
  cart: CartLine[]
  onAdd: (s: ServiceItem) => void
}) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const closeTimer            = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtered = services
    .filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.category ?? '').toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 9)

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <div className="relative">
      <input
        type="text" value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { cancelClose(); setOpen(true) }}
        onBlur={scheduleClose}
        className={inputCls} placeholder="Ajouter une prestation…" autoComplete="off"
      />
      {open && (
        <ul className="absolute z-[60] mt-1 max-h-64 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? filtered.map((s) => {
            const already = cart.some(l => l.service.id === s.id)
            return (
              <li key={s.id}>
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); cancelClose(); onAdd(s); setQuery(''); setOpen(false) }}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  staffNames: string[]
  clients: ClientItem[]
  services: ServiceItem[]
  existingAppointments: ExistingAppt[]
}

export function AddAppointmentButton({ staffNames, clients, services, existingAppointments }: Props) {
  const [open,     setOpen]    = useState(false)
  const [error,    setError]   = useState('')
  const [pending,  startTx]    = useTransition()

  const today = new Date().toISOString().split('T')[0]

  const [cart,      setCart]      = useState<CartLine[]>([])
  const [date,      setDate]      = useState(today)
  const [time,      setTime]      = useState('09:00')
  const [staffName, setStaffName] = useState('')
  const [conflict,  setConflict]  = useState(false)

  const totalPrice    = cart.reduce((s, l) => s + (l.service.price    ?? 0) * l.qty, 0)
  const totalDuration = cart.reduce((s, l) => s + (l.service.duration ?? 60) * l.qty, 0)

  function addService(svc: ServiceItem) {
    setCart(prev => {
      const i = prev.findIndex(l => l.service.id === svc.id)
      if (i >= 0) { const n = [...prev]; n[i] = { ...n[i], qty: n[i].qty + 1 }; return n }
      return [...prev, { service: svc, qty: 1 }]
    })
  }
  function removeService(id: string) {
    setCart(prev => prev.filter(l => l.service.id !== id))
  }
  function setQty(id: string, qty: number) {
    if (qty <= 0) return removeService(id)
    setCart(prev => prev.map(l => l.service.id === id ? { ...l, qty } : l))
  }

  function recheck(d: string, t: string, s: string, dur: number) {
    setConflict(detectConflict(d, t, s, dur, existingAppointments))
  }

  function handleClose() {
    setOpen(false); setError('')
    setCart([]); setDate(today); setTime('09:00'); setStaffName(''); setConflict(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!fd.get('client_name')) { setError('Le nom du client est requis'); return }
    if (cart.length === 0)      { setError('Ajoutez au moins une prestation'); return }

    // Inject computed fields into FormData
    const combinedName = cart.map(l => l.qty > 1 ? `${l.service.name} ×${l.qty}` : l.service.name).join(' + ')
    fd.set('service_name', combinedName)
    fd.set('price',        String(totalPrice))
    fd.set('duration',     String(totalDuration))

    startTx(async () => {
      const result = await createAppointmentAction(fd)
      if (result.error) { setError(result.error); return }
      handleClose()
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
        <Plus className="h-4 w-4" /> Nouveau RDV
      </button>

      <Modal open={open} onClose={handleClose} title="Nouveau rendez-vous">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client */}
          <div>
            <label className={labelCls}>Client *</label>
            <ClientCombobox clients={clients} />
          </div>

          {/* Prestations */}
          <div>
            <label className={labelCls}>Prestations *</label>
            <ServicePicker services={services} cart={cart} onAdd={addService} />

            {/* Cart lines */}
            {cart.length > 0 && (
              <ul className="mt-2 space-y-1.5 rounded-md border border-stone-100 bg-stone-50 p-2">
                {cart.map(({ service: svc, qty }) => (
                  <li key={svc.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate font-medium text-slate-800">{svc.name}</span>
                    {/* qty controls */}
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setQty(svc.id, qty - 1)}
                        className="h-5 w-5 rounded border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 flex items-center justify-center text-xs cursor-pointer">−</button>
                      <span className="w-4 text-center text-xs font-semibold">{qty}</span>
                      <button type="button" onClick={() => setQty(svc.id, qty + 1)}
                        className="h-5 w-5 rounded border border-stone-200 bg-white text-stone-500 hover:bg-stone-100 flex items-center justify-center text-xs cursor-pointer">+</button>
                    </div>
                    {svc.price != null && (
                      <span className="w-20 shrink-0 text-right text-xs font-semibold text-primary-700">
                        {(svc.price * qty).toLocaleString('fr-FR')} F
                      </span>
                    )}
                    <button type="button" onClick={() => removeService(svc.id)}
                      className="shrink-0 text-stone-300 hover:text-rose-500 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}

                {/* Totals */}
                <li className="mt-1.5 flex items-center justify-between border-t border-stone-200 pt-1.5">
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <ShoppingBag className="h-3 w-3" />
                    {cart.reduce((s, l) => s + l.qty, 0)} prestation{cart.reduce((s, l) => s + l.qty, 0) > 1 ? 's' : ''}
                    · {totalDuration} min
                  </span>
                  <span className="text-sm font-bold text-primary-700">{totalPrice.toLocaleString('fr-FR')} F</span>
                </li>
              </ul>
            )}
          </div>

          {/* Thérapeute */}
          <div>
            <label className={labelCls}>Thérapeute</label>
            <select name="staff_name" value={staffName}
              onChange={(e) => {
                setStaffName(e.target.value)
                recheck(date, time, e.target.value, totalDuration)
              }}
              className={inputCls}>
              <option value="">— Choisir —</option>
              {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input name="date" type="date" required value={date}
                onChange={(e) => { setDate(e.target.value); recheck(e.target.value, time, staffName, totalDuration) }}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Heure *</label>
              <input name="time" type="time" required value={time}
                onChange={(e) => { setTime(e.target.value); recheck(date, e.target.value, staffName, totalDuration) }}
                className={inputCls} />
            </div>
          </div>

          {conflict && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ce thérapeute a déjà un rendez-vous à ce créneau. Vous pouvez quand même confirmer.
            </div>
          )}

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleClose}
              className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Créer RDV'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
