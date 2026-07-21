'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPlanAction, updatePlanAction, deletePlanAction, togglePlanAction } from '@/app/actions/plans'
import type { PlanFormData } from '@/app/actions/plans'
import type { MembershipPlan } from '@/lib/db/subscriptions'

const COLOR_OPTIONS = [
  { label: 'Teal',   value: 'from-teal-500 to-teal-700' },
  { label: 'Violet', value: 'from-violet-500 to-violet-700' },
  { label: 'Amber',  value: 'from-amber-500 to-amber-700' },
  { label: 'Rose',   value: 'from-rose-500 to-rose-700' },
  { label: 'Slate',  value: 'from-slate-500 to-slate-700' },
  { label: 'Emerald',value: 'from-emerald-500 to-emerald-700' },
]

const FREQ_OPTIONS = ['mensuel', 'trimestriel', 'annuel', 'unique']

interface PlanFormProps {
  plan?: MembershipPlan
  onClose: () => void
}

function PlanForm({ plan, onClose }: PlanFormProps) {
  const isEdit = !!plan
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [name, setName]             = useState(plan?.name ?? '')
  const [price, setPrice]           = useState(String(plan?.price ?? ''))
  const [remise, setRemise]         = useState(String(plan?.remise ?? '0'))
  const [color, setColor]           = useState(plan?.color ?? COLOR_OPTIONS[0].value)
  const [avantages, setAvantages]   = useState((plan?.avantages ?? []).join('\n'))
  const [description, setDesc]      = useState(plan?.description ?? '')
  const [durationDays, setDuration] = useState(String(plan?.duration_days ?? ''))
  const [sessions, setSessions]     = useState(String(plan?.sessions_count ?? ''))
  const [frequency, setFrequency]   = useState(plan?.payment_frequency ?? 'mensuel')
  const [services, setServices]     = useState((plan?.services ?? []).join('\n'))
  const [conditions, setConditions] = useState(plan?.conditions ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const data: PlanFormData = {
      name: name.trim(),
      price: Number(price),
      remise: Number(remise),
      color,
      avantages: avantages.split('\n').map(s => s.trim()).filter(Boolean),
      description: description.trim(),
      duration_days: durationDays ? Number(durationDays) : null,
      sessions_count: sessions ? Number(sessions) : null,
      payment_frequency: frequency,
      services: services.split('\n').map(s => s.trim()).filter(Boolean),
      conditions: conditions.trim(),
      active: true,
    }
    if (!data.name) { setError('Le nom est requis'); return }
    if (!data.price || data.price <= 0) { setError('Le prix doit être positif'); return }

    startTransition(async () => {
      const result = isEdit
        ? await updatePlanAction(plan!.id, data)
        : await createPlanAction(data)
      if (result.error) { setError(result.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{isEdit ? 'Modifier le plan' : 'Nouveau plan'}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-stone-100">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">Nom du plan *</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Ex: Gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Prix (F) *</label>
              <input
                type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Remise (%)</label>
              <input
                type="number" min="0" max="100" value={remise} onChange={e => setRemise(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Durée (jours)</label>
              <input
                type="number" value={durationDays} onChange={e => setDuration(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Séances incluses</label>
              <input
                type="number" value={sessions} onChange={e => setSessions(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="4"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Fréquence de paiement</label>
              <select
                value={frequency} onChange={e => setFrequency(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Couleur carte</label>
              <select
                value={color} onChange={e => setColor(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Description</label>
            <input
              value={description} onChange={e => setDesc(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Courte description du plan..."
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Avantages (un par ligne)</label>
            <textarea
              value={avantages} onChange={e => setAvantages(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder={"Massage 60 min\nAccès sauna illimité\nRemise 15% boutique"}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Soins inclus (un par ligne)</label>
            <textarea
              value={services} onChange={e => setServices(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder={"Massage relaxant\nSoin visage"}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Conditions</label>
            <input
              value={conditions} onChange={e => setConditions(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Non cumulable, sans engagement..."
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">
              Annuler
            </button>
            <button type="submit" disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60">
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer le plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AddPlanButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        <Plus className="h-4 w-4" />
        Nouveau plan
      </button>
      {open && <PlanForm onClose={() => setOpen(false)} />}
    </>
  )
}

export function EditPlanButton({ plan }: { plan: MembershipPlan }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        title="Modifier"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      {open && <PlanForm plan={plan} onClose={() => setOpen(false)} />}
    </>
  )
}

export function TogglePlanButton({ plan }: { plan: MembershipPlan }) {
  const [pending, startTransition] = useTransition()
  const isActive = plan.active !== false

  return (
    <button
      onClick={() => startTransition(async () => { await togglePlanAction(plan.id, isActive) })}
      disabled={pending}
      className={cn('rounded-md p-1.5 transition-colors', isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100')}
      title={isActive ? 'Désactiver' : 'Activer'}
    >
      {pending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : isActive
          ? <ToggleRight className="h-3.5 w-3.5" />
          : <ToggleLeft className="h-3.5 w-3.5" />
      }
    </button>
  )
}

export function DeletePlanButton({ plan }: { plan: MembershipPlan }) {
  const [confirm, setConfirm] = useState(false)
  const [pending, startTransition] = useTransition()

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => startTransition(async () => { await deletePlanAction(plan.id) })}
          disabled={pending}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Suppr.'}
        </button>
        <button onClick={() => setConfirm(false)} className="rounded-md px-2 py-1 text-[11px] text-stone-500 hover:bg-stone-100">
          Non
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
      title="Supprimer"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
