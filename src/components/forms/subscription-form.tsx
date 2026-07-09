'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Plus, Loader2, BadgeCheck } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createSubscriptionAction } from '@/app/actions/subscriptions'
import { cn } from '@/lib/utils'

interface Plan       { id: string; name: string; price: number }
interface ClientItem { id: string; name: string }

const SOINS_DEFAUT: Record<string, string> = {
  Bronze:   '4',
  Silver:   '8',
  Gold:     'illimité',
  Platinum: 'illimité',
}

// ─── Inline client combobox ──────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, cb])
}

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
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => value.length >= 1 && setOpen(true)}
        placeholder="Rechercher ou saisir un nom…"
        autoComplete="off"
        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-50"
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

// ─── Main component ───────────────────────────────────────────────────────────

export function AddSubscriptionButton({
  plans,
  clients,
}: {
  plans: Plan[]
  clients: ClientItem[]
}) {
  const [open, setOpen]                 = useState(false)
  const [error, setError]               = useState('')
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.name ?? '')
  const [soins, setSoins]               = useState(SOINS_DEFAUT[plans[0]?.name ?? ''] ?? '')
  const [isPending, startTransition]    = useTransition()

  function choosePlan(name: string) {
    setSelectedPlan(name)
    setSoins(SOINS_DEFAUT[name] ?? '')
  }

  function handleClose() {
    setOpen(false)
    setError('')
    setSelectedPlan(plans[0]?.name ?? '')
    setSoins(SOINS_DEFAUT[plans[0]?.name ?? ''] ?? '')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    if (!String(fd.get('client_name') ?? '').trim()) {
      setError('Le nom du client est requis')
      return
    }
    fd.set('soins_restants', soins)
    startTransition(async () => {
      try {
        await createSubscriptionAction(fd)
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    })
  }

  const today   = new Date().toISOString().split('T')[0]
  const planObj = plans.find((p) => p.name === selectedPlan)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nouvel abonné
      </button>

      <Modal open={open} onClose={handleClose} title="Nouvel abonnement">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Client <span className="text-rose-500">*</span>
            </label>
            <ClientCombobox clients={clients} />
          </div>

          {/* Formule */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Formule <span className="text-rose-500">*</span>
            </label>
            <input type="hidden" name="plan_name" value={selectedPlan} />
            <input type="hidden" name="plan_id"   value={planObj?.id ?? ''} />
            <div className="grid grid-cols-2 gap-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => choosePlan(plan.name)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all cursor-pointer',
                    selectedPlan === plan.name
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  )}
                >
                  <BadgeCheck className={cn('h-4 w-4 shrink-0', selectedPlan === plan.name ? 'text-primary-500' : 'text-stone-400')} />
                  <div className="min-w-0">
                    <p className="font-medium leading-none">{plan.name}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{plan.price.toLocaleString('fr-FR')} F/mois</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date de début</label>
              <input
                name="since"
                type="date"
                defaultValue={today}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Soins restants</label>
              <input
                type="text"
                value={soins}
                onChange={(e) => setSoins(e.target.value)}
                placeholder="ex: 4, illimité…"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-50"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer transition-colors"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Enregistrement…' : "Créer l'abonnement"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
