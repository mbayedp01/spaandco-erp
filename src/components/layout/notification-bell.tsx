'use client'

import { useState } from 'react'
import { Bell, X, Clock, User } from 'lucide-react'
import type { AuditLogEntry } from '@/lib/db/audit'

export type { AuditLogEntry }

const actionLabel: Record<string, string> = {
  created: 'a créé',
  updated: 'a modifié',
  deleted: 'a supprimé',
}

const entityLabel: Record<string, string> = {
  client:       'un client',
  staff:        'un membre du personnel',
  service:      'une prestation',
  subscription: 'un abonnement',
  inventory:    'un article',
  supplier:     'un fournisseur',
  transaction:  'une transaction',
}

const actionStyle: Record<string, string> = {
  created: 'bg-emerald-50 text-emerald-700',
  updated: 'bg-amber-50 text-amber-700',
  deleted: 'bg-rose-50 text-rose-700',
}

const actionLabel2: Record<string, string> = {
  created: 'Création',
  updated: 'Modification',
  deleted: 'Suppression',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function NotificationBell({ logs }: { logs: AuditLogEntry[] }) {
  const [open, setOpen] = useState(false)
  const count = logs.length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-md p-2 text-stone-500 hover:bg-stone-100 cursor-pointer transition-colors"
        title="Journal d'activité caissiers"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Journal d&apos;activité</h2>
                <p className="text-xs text-stone-400">Actions récentes des caissiers</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="mb-2 h-8 w-8 text-stone-300" />
                  <p className="text-sm font-medium text-stone-500">Aucune activité</p>
                  <p className="mt-1 text-xs text-stone-400">
                    Les actions des caissiers apparaîtront ici
                  </p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100">
                          <User className="h-3.5 w-3.5 text-stone-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900">
                            <span className="font-medium">
                              {log.actor_email?.split('@')[0] ?? 'Caissier'}
                            </span>{' '}
                            {actionLabel[log.action] ?? log.action}{' '}
                            <span className="text-stone-600">
                              {log.entity_name ?? entityLabel[log.entity_type] ?? log.entity_type}
                            </span>
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              actionStyle[log.action] ?? 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {actionLabel2[log.action] ?? log.action}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-[10px] text-stone-400">
                        <Clock className="h-3 w-3" />
                        <span className="whitespace-nowrap">{formatTime(log.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
