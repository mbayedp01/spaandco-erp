'use client'

import { useState, useTransition } from 'react'
import { UserCog, Check } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { setTransactionLineItemsAction } from '@/app/actions/cash'
import { legacyLines, type LineItem } from '@/lib/line-items'

interface Props {
  transactionId: string
  label: string | null
  amount: number
  lineItems: LineItem[] | null
  performers: string[]
  staffNames: string[]
  servicePrices: Record<string, number>
}

function initialLines({ label, amount, lineItems, performers, servicePrices }: Props): LineItem[] {
  if (lineItems && lineItems.length > 0) return lineItems
  const parts = legacyLines(label)
  if (parts.length <= 1) {
    const p = parts[0] ?? { name: label ?? 'Prestation', qty: 1 }
    return [{ name: p.name, qty: p.qty, price: p.qty === 1 ? amount : null, performers }]
  }
  // Recover per-line prices from the catalogue only when they add up to the paid total.
  const known = parts.map(p => servicePrices[p.name] ?? null)
  const missing = known.filter(k => k === null).length
  const knownSum = known.reduce<number>((s, k, i) => s + (k ?? 0) * parts[i].qty, 0)
  const prices = missing === 0 && knownSum === amount
    ? known
    : missing === 1 && amount > knownSum
      ? known.map((k, i) => k ?? (amount - knownSum) / parts[i].qty)
      : parts.map(() => null)
  return parts.map((p, i) => ({
    name: p.name, qty: p.qty, price: prices[i],
    performers: performers.length === 1 ? performers : [],
  }))
}

export function PerformerEditor(props: Props) {
  const { transactionId, lineItems, performers, staffNames } = props
  const current = initialLines(props)
  const isLegacyShared = !(lineItems && lineItems.length > 0) && current.length > 1 && performers.length > 1

  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState<LineItem[]>(current)
  const [error, setError] = useState('')
  const [pending, start]  = useTransition()

  function openModal() {
    setDraft(initialLines(props))
    setError('')
    setOpen(true)
  }
  function toggle(index: number, name: string) {
    setDraft(prev => prev.map((l, i) => i !== index ? l : {
      ...l,
      performers: l.performers.includes(name) ? l.performers.filter(n => n !== name) : [...l.performers, name],
    }))
  }
  function save() {
    setError('')
    start(async () => {
      const res = await setTransactionLineItemsAction(transactionId, draft)
      if (res.error) { setError(res.error); return }
      setOpen(false)
    })
  }

  const lineTitle = (l: LineItem) => `${l.name}${l.qty > 1 ? ` ×${l.qty}` : ''}`

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mt-0.5 flex flex-col items-start gap-0.5 rounded-md text-left text-xs text-stone-400 hover:text-primary-600 cursor-pointer"
        title="Praticien(s) ayant réalisé chaque prestation"
      >
        {current.length === 1 || isLegacyShared ? (
          <span className="inline-flex items-center gap-1">
            <UserCog className="h-3 w-3 shrink-0" />
            {performers.length > 0
              ? <span className="font-medium text-stone-500">{performers.join(', ')}</span>
              : <span className="italic">Ajouter praticien</span>}
            {isLegacyShared && <span className="italic text-amber-600">· à répartir par prestation</span>}
          </span>
        ) : current.map((l, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <UserCog className="h-3 w-3 shrink-0" />
            <span className="text-stone-400">{lineTitle(l)} —</span>
            {l.performers.length > 0
              ? <span className="font-medium text-stone-500">{l.performers.join(', ')}</span>
              : <span className="italic">à attribuer</span>}
          </span>
        ))}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Praticien(s) par prestation">
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Pour chaque prestation, sélectionnez qui l&apos;a réalisée. Vous pouvez en choisir plusieurs, modifier ou tout retirer.
          </p>

          {isLegacyShared && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Praticiens enregistrés sur cette transaction : <span className="font-semibold">{performers.join(', ')}</span>. Attribuez-les à chaque prestation.
            </p>
          )}

          {staffNames.length === 0 ? (
            <p className="text-xs text-stone-400">Aucun praticien enregistré pour cet établissement.</p>
          ) : (
            <div className="max-h-[55vh] space-y-3 overflow-y-auto">
              {draft.map((l, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-3">
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">{lineTitle(l)}</span>
                    {l.price != null && (
                      <span className="shrink-0 text-xs tabular-nums text-stone-400">{(l.price * l.qty).toLocaleString('fr-FR')} F</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {staffNames.map(name => {
                      const on = l.performers.includes(name)
                      return (
                        <button
                          key={name} type="button" onClick={() => toggle(i, name)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                            on
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="button" onClick={save} disabled={pending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              <Check className="h-3.5 w-3.5" />
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
