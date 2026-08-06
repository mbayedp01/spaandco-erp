'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Clock, User, Smartphone, Calendar, Scissors } from 'lucide-react'
import type { AuditLogEntry } from '@/lib/audit-types'
import type { KioskAppointment } from '@/lib/db/kiosk-appointments'
import { createClient } from '@/lib/supabase/client'

export type { AuditLogEntry }

// ─── Audit helpers ────────────────────────────────────────────────────────────
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

// ─── Kiosque helpers ──────────────────────────────────────────────────────────
function parsePhone(notes: string | null) {
  return notes?.match(/Tel:\s*([^|]+)/)?.[1]?.trim() ?? null
}
function parseTotal(notes: string | null) {
  return notes?.match(/Total:\s*(.+)/)?.[1]?.trim() ?? null
}
function relativeTime(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'à l\'instant'
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  return `il y a ${Math.floor(hrs / 24)}j`
}
function fmtApptDate(date: string, time: string | null) {
  const d = new Date(date + 'T12:00:00')
  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
  const label = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  return time ? `${label} · ${time}` : label
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function NotificationBell({
  logs,
  kioskAppts: initial = [],
  showJournal = false,
}: {
  logs: AuditLogEntry[]
  kioskAppts?: KioskAppointment[]
  showJournal?: boolean
}) {
  const [open,  setOpen]  = useState(false)
  const [tab,   setTab]   = useState<'kiosque' | 'journal'>('kiosque')
  const [kiosk, setKiosk] = useState<KioskAppointment[]>(initial)

  // Realtime : nouvelles réservations kiosque
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel('kiosk-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (p) => {
        const a = p.new as KioskAppointment
        if (a.status === 'pending' && a.notes?.includes('Borne kiosque')) {
          setKiosk(prev => [a, ...prev])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const kioskCount  = kiosk.length
  const totalBadge  = kioskCount + (showJournal ? logs.length : 0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-md p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {totalBadge > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[9px] font-bold text-white leading-none">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col bg-white dark:bg-slate-800 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-xs text-stone-400">{kioskCount} réservation{kioskCount !== 1 ? 's' : ''} kiosque en attente</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            {showJournal && (
              <div className="flex border-b border-stone-200 dark:border-slate-700 text-sm">
                {(['kiosque', 'journal'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 font-medium capitalize transition-colors ${
                      tab === t
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}>
                    {t === 'kiosque' ? `Kiosque${kioskCount > 0 ? ` (${kioskCount})` : ''}` : 'Journal'}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-700">

              {/* ── Kiosque tab ── */}
              {(!showJournal || tab === 'kiosque') && (
                kiosk.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bell className="mb-2 h-8 w-8 text-stone-300" />
                    <p className="text-sm font-medium text-stone-500">Aucune réservation kiosque</p>
                    <p className="mt-1 text-xs text-stone-400">Les réservations apparaîtront ici en temps réel</p>
                  </div>
                ) : (
                  kiosk.map(appt => {
                    const phone = parsePhone(appt.notes)
                    const total = parseTotal(appt.notes)
                    return (
                      <div key={appt.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                              Borne kiosque
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">{relativeTime(appt.created_at)}</span>
                        </div>

                        <p className="font-medium text-slate-900 dark:text-white text-sm">{appt.client_name ?? '—'}</p>

                        <div className="mt-1.5 space-y-1">
                          {phone && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400">
                              <Smartphone className="h-3 w-3 shrink-0" /> {phone}
                            </div>
                          )}
                          {appt.service_name && (
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400">
                              <Scissors className="h-3 w-3 shrink-0" /> {appt.service_name}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {fmtApptDate(appt.date, appt.time)}
                            {appt.staff_name && <span className="text-stone-400"> · {appt.staff_name}</span>}
                          </div>
                        </div>

                        {total && (
                          <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-400">{total}</p>
                        )}
                      </div>
                    )
                  })
                )
              )}

              {/* ── Journal tab (admin) ── */}
              {showJournal && tab === 'journal' && (
                logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bell className="mb-2 h-8 w-8 text-stone-300" />
                    <p className="text-sm font-medium text-stone-500">Aucune activité</p>
                    <p className="mt-1 text-xs text-stone-400">Les actions des caissiers apparaîtront ici</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-slate-700">
                            <User className="h-3.5 w-3.5 text-stone-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-900 dark:text-white">
                              <span className="font-medium">{log.actor_email?.split('@')[0] ?? 'Caissier'}</span>{' '}
                              {actionLabel[log.action] ?? log.action}{' '}
                              <span className="text-stone-600 dark:text-slate-300">
                                {log.entity_name ?? entityLabel[log.entity_type] ?? log.entity_type}
                              </span>
                            </p>
                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${actionStyle[log.action] ?? 'bg-stone-100 text-stone-600'}`}>
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
                )
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
