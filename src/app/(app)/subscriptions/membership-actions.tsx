'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { updateMembershipAction, deleteMembershipAction } from '@/app/actions/subscriptions'

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

interface Membership {
  id: string
  client_name: string | null
  status: string
  soins_restants: string | null
  next_billing: string | null
}

export function EditMembershipButton({ membership }: { membership: Membership }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateMembershipAction(membership.id, fd)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Modifier — ${membership.client_name}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Statut</label>
            <select name="status" defaultValue={membership.status} className={inputCls}>
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Soins restants</label>
            <input name="soins_restants" defaultValue={membership.soins_restants ?? ''} className={inputCls} placeholder="4 / illimité" />
          </div>
          <div>
            <label className={labelCls}>Prochaine facture</label>
            <input name="next_billing" type="date" defaultValue={membership.next_billing ?? ''} className={inputCls} />
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export function DeleteMembershipButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer cet abonnement ?')) return
    startTransition(() => deleteMembershipAction(id))
  }
  return (
    <button onClick={handleDelete} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40" title="Supprimer">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
