'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
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

// ─── Client combobox ─────────────────────────────────────────────────────────

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
      {/* hidden — the value actually submitted */}
      <input type="hidden" name="client_name" value={value} />
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => value.length >= 1 && setOpen(true)}
        className={inputCls}
        placeholder="Rechercher ou saisir un nom…"
        autoComplete="off"
      />
      {open && value.length >= 1 && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={() => { setValue(c.name); setOpen(false) }}
                className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-primary-50 hover:text-primary-700"
              >
                {c.name}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-2.5 text-xs text-stone-400">
              Nouveau client :{' '}
              <span className="font-medium text-slate-700">«{value}»</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Service combobox ─────────────────────────────────────────────────────────

function ServiceCombobox({
  services,
  onSelect,
}: {
  services: ServiceItem[]
  onSelect: (s: ServiceItem) => void
}) {
  const [value, setValue] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const filtered = services
    .filter(
      (s) =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        (s.category ?? '').toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 9)

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        name="service_name"
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className={inputCls}
        placeholder="Rechercher une prestation…"
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={() => { setValue(s.name); setOpen(false); onSelect(s) }}
                  className="w-full px-3 py-2 text-left hover:bg-primary-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{s.name}</span>
                    {s.price != null && (
                      <span className="shrink-0 text-xs font-semibold text-primary-700">
                        {s.price.toLocaleString('fr-FR')} F
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    {s.category && <span>{s.category}</span>}
                    {s.duration && <span>· {s.duration} min</span>}
                  </div>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-stone-400">Aucune prestation trouvée</li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  staffNames: string[]
  clients: ClientItem[]
  services: ServiceItem[]
  existingAppointments: ExistingAppt[]
}

export function AddAppointmentButton({
  staffNames,
  clients,
  services,
  existingAppointments,
}: Props) {
  const [open, setOpen]             = useState(false)
  const [error, setError]           = useState('')
  const [pending, startTransition]  = useTransition()

  const today = new Date().toISOString().split('T')[0]

  const [price,     setPrice]     = useState('')
  const [duration,  setDuration]  = useState('60')
  const [date,      setDate]      = useState(today)
  const [time,      setTime]      = useState('09:00')
  const [staffName, setStaffName] = useState('')
  const [conflict,  setConflict]  = useState(false)

  function recheck(d: string, t: string, s: string, dur: string) {
    setConflict(detectConflict(d, t, s, Number(dur) || 60, existingAppointments))
  }

  function handleClose() {
    setOpen(false); setError('')
    setPrice(''); setDuration('60'); setDate(today)
    setTime('09:00'); setStaffName(''); setConflict(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!fd.get('client_name')) {
      setError('Le nom du client est requis')
      return
    }
    startTransition(async () => {
      const result = await createAppointmentAction(fd)
      if (result.error) { setError(result.error); return }
      handleClose()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Nouveau RDV
      </button>

      <Modal open={open} onClose={handleClose} title="Nouveau rendez-vous">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client */}
          <div>
            <label className={labelCls}>Client *</label>
            <ClientCombobox clients={clients} />
          </div>

          {/* Prestation */}
          <div>
            <label className={labelCls}>Prestation</label>
            <ServiceCombobox
              services={services}
              onSelect={(svc) => {
                if (svc.price    != null) setPrice(String(svc.price))
                if (svc.duration != null) {
                  setDuration(String(svc.duration))
                  recheck(date, time, staffName, String(svc.duration))
                }
              }}
            />
          </div>

          {/* Thérapeute */}
          <div>
            <label className={labelCls}>Thérapeute</label>
            <select
              name="staff_name"
              value={staffName}
              onChange={(e) => {
                setStaffName(e.target.value)
                recheck(date, time, e.target.value, duration)
              }}
              className={inputCls}
            >
              <option value="">— Choisir —</option>
              {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input
                name="date" type="date" required value={date}
                onChange={(e) => { setDate(e.target.value); recheck(e.target.value, time, staffName, duration) }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Heure *</label>
              <input
                name="time" type="time" required value={time}
                onChange={(e) => { setTime(e.target.value); recheck(date, e.target.value, staffName, duration) }}
                className={inputCls}
              />
            </div>
          </div>

          {/* Conflict warning */}
          {conflict && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ce thérapeute a déjà un rendez-vous à ce créneau. Vous pouvez quand même confirmer.
            </div>
          )}

          {/* Durée + Prix */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Durée (min)</label>
              <input
                name="duration" type="number" min="15" step="15" value={duration}
                onChange={(e) => { setDuration(e.target.value); recheck(date, time, staffName, e.target.value) }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Prix (F)</label>
              <input
                name="price" type="number" min="0" value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls} placeholder="25000"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
            >
              {pending ? 'Enregistrement…' : 'Créer RDV'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
