'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { createClientAction, updateClientAction, deleteClientAction } from '@/app/actions/clients'
import type { Database } from '@/lib/supabase/types'

type Client = Database['public']['Tables']['clients']['Row']

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function ClientForm({ client, onClose }: { client?: Client; onClose: () => void }) {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (client) {
          await updateClientAction(client.id, fd)
        } else {
          await createClientAction(fd)
          ;(e.target as HTMLFormElement).reset()
        }
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Prénom *</label>
          <input name="first_name" required defaultValue={client?.first_name} className={inputCls} placeholder="Aïssatou" />
        </div>
        <div>
          <label className={labelCls}>Nom *</label>
          <input name="last_name" required defaultValue={client?.last_name} className={inputCls} placeholder="Diop" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" type="email" defaultValue={client?.email ?? ''} className={inputCls} placeholder="email@exemple.com" />
      </div>
      <div>
        <label className={labelCls}>Téléphone</label>
        <input name="phone" defaultValue={client?.phone ?? ''} className={inputCls} placeholder="+221 77 000 00 00" />
      </div>
      <div>
        <label className={labelCls}>Date d&apos;anniversaire</label>
        <input name="birth_date" type="date" defaultValue={client?.birth_date ?? ''} className={inputCls} />
      </div>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
          Annuler
        </button>
        <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
          {pending ? 'Enregistrement…' : client ? 'Enregistrer' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

export function AddClientButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
        <Plus className="h-4 w-4" />
        Nouveau client
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau client">
        <ClientForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function EditClientButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le client">
        <ClientForm client={client} onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}

export function DeleteClientButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer ce client ?')) return
    startTransition(() => deleteClientAction(id))
  }
  return (
    <button onClick={handleDelete} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-40" title="Supprimer">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
