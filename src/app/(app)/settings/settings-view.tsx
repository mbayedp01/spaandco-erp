'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import {
  Building2, Clock, Bell, Shield, Users, CreditCard, Calendar,
  Activity, ChevronRight, Check, AlertCircle, Pencil, Plus,
  Globe, Phone, Mail, MapPin, Instagram, Facebook, ExternalLink,
  Eye, EyeOff, Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateEstablishment } from '@/app/actions/establishments'
import { updateUserRoleAction, toggleUserStatusAction, createUserAction } from '@/app/actions/users'
import type { Database } from '@/lib/supabase/types'
import type { AuditLogEntry } from '@/lib/audit-types'
import type { UserProfile } from '@/lib/db/users'

type Establishment = Database['public']['Tables']['establishments']['Row']

// ── Types ─────────────────────────────────────────────────────────────────────

type Section =
  | 'etablissement'
  | 'horaires'
  | 'notifications'
  | 'rendez-vous'
  | 'paiements'
  | 'utilisateurs'
  | 'securite'
  | 'journal'

const NAV: { key: Section; icon: React.ElementType; label: string; desc: string }[] = [
  { key: 'etablissement', icon: Building2,  label: 'Établissement',  desc: 'Nom, adresse, contact'       },
  { key: 'horaires',      icon: Clock,       label: 'Horaires',       desc: "Jours et heures d'ouverture" },
  { key: 'notifications', icon: Bell,        label: 'Notifications',  desc: 'Alertes et rappels'          },
  { key: 'rendez-vous',   icon: Calendar,    label: 'Rendez-vous',    desc: 'Paramètres de réservation'   },
  { key: 'paiements',     icon: CreditCard,  label: 'Paiements',      desc: 'Méthodes et facturation'     },
  { key: 'utilisateurs',  icon: Users,       label: 'Utilisateurs',   desc: 'Comptes et rôles'            },
  { key: 'securite',      icon: Shield,      label: 'Sécurité',       desc: 'Accès et confidentialité'    },
  { key: 'journal',       icon: Activity,    label: 'Journal',        desc: "Historique d'activité"       },
]

// ── Local storage hook ─────────────────────────────────────────────────────────

function useLocalPref<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial)
  useEffect(() => {
    try {
      const s = localStorage.getItem(`spa-cfg-${key}`)
      if (s) setValue(JSON.parse(s))
    } catch {}
  }, [key])
  const set = useCallback(
    (v: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try { localStorage.setItem(`spa-cfg-${key}`, JSON.stringify(next)) } catch {}
        return next
      }),
    [key],
  )
  return [value, set]
}

// ── Toast ──────────────────────────────────────────────────────────────────────

type Toast = { id: number; type: 'success' | 'error'; msg: string }

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((type: Toast['type'], msg: string) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, type, msg }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }, [])
  return { toasts, push }
}

// ── Shared UI atoms ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-stone-400 dark:text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs', className)}>
      {children}
    </div>
  )
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0 shrink-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-stone-400 dark:text-slate-500">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', className,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-52 rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-stone-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition',
        className,
      )}
    />
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors duration-200',
        enabled ? 'bg-primary-600' : 'bg-stone-200 dark:bg-slate-600',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function SaveButton({ onClick, pending, label = 'Enregistrer' }: { onClick: () => void; pending?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 transition cursor-pointer"
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <Check className="h-4 w-4" />
      )}
      {label}
    </button>
  )
}

function LocalBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
      <Wifi className="h-3 w-3" />
      Sauvegardé localement
    </span>
  )
}

// ── Section: Établissement ─────────────────────────────────────────────────────

type EstabForm = { name: string; city: string; address: string; phone: string; email: string; website: string; description: string; instagram: string; facebook: string }

function EtablissementSection({
  establishment,
  onSave,
  pending,
}: {
  establishment: Establishment | null
  onSave: (form: EstabForm) => void
  pending: boolean
}) {
  const [form, setForm] = useState<EstabForm>({
    name:        establishment?.name    ?? 'Spa and Co',
    city:        establishment?.city    ?? 'Dakar',
    address:     establishment?.address ?? '',
    phone:       establishment?.phone   ?? '',
    email:       'contact@spaandco.sn',
    website:     'www.spaandco.sn',
    description: 'Espace de bien-être et de beauté au cœur de Dakar.',
    instagram:   '@spaandco_dakar',
    facebook:    'SpaAndCoDakar',
  })
  const f = (k: keyof EstabForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5">
      <SectionHeader icon={Building2} title="Établissement" subtitle="Informations de base enregistrées dans la base de données" />

      <Card>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Nom du spa" hint="Affiché dans toute l'application">
            <Input value={form.name} onChange={f('name')} placeholder="Nom de l'établissement" />
          </FieldRow>
          <FieldRow label="Ville">
            <Input value={form.city} onChange={f('city')} placeholder="Dakar" />
          </FieldRow>
          <FieldRow label="Adresse complète">
            <Input value={form.address} onChange={f('address')} placeholder="Rue, quartier…" />
          </FieldRow>
          <FieldRow label="Téléphone">
            <Input value={form.phone} onChange={f('phone')} type="tel" placeholder="+221 33 000 00 00" />
          </FieldRow>
        </div>
        <div className="flex justify-end border-t border-stone-100 dark:border-slate-700 px-5 py-3">
          <SaveButton onClick={() => onSave(form)} pending={pending} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Coordonnées & présence en ligne</p>
          <LocalBadge />
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Email de contact" hint="Visible par les clients">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone-400" />
              <Input value={form.email} onChange={f('email')} type="email" placeholder="contact@spa.sn" />
            </div>
          </FieldRow>
          <FieldRow label="Site web">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-stone-400" />
              <Input value={form.website} onChange={f('website')} placeholder="www.spa.sn" />
            </div>
          </FieldRow>
          <FieldRow label="Instagram">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-stone-400" />
              <Input value={form.instagram} onChange={f('instagram')} placeholder="@spa" />
            </div>
          </FieldRow>
          <FieldRow label="Facebook">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-stone-400" />
              <Input value={form.facebook} onChange={f('facebook')} placeholder="NomPage" />
            </div>
          </FieldRow>
        </div>
        <div className="px-5 py-3 border-t border-stone-100 dark:border-slate-700">
          <p className="text-xs text-stone-400 dark:text-slate-500">
            Ces informations sont sauvegardées dans votre navigateur. Pour une persistance complète, exécutez la migration SQL fournie.
          </p>
        </div>
      </Card>

      <Card>
        <div className="px-5 py-3.5 border-b border-stone-100 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Description</p>
        </div>
        <div className="px-5 py-4">
          <textarea
            value={form.description}
            onChange={(e) => f('description')(e.target.value)}
            rows={3}
            placeholder="Décrivez votre établissement…"
            className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-stone-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition resize-none"
          />
        </div>
      </Card>
    </div>
  )
}

// ── Section: Horaires ──────────────────────────────────────────────────────────

const DAYS = [
  { key: 'lundi',    label: 'Lundi'    },
  { key: 'mardi',    label: 'Mardi'    },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi',    label: 'Jeudi'    },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi',   label: 'Samedi'   },
  { key: 'dimanche', label: 'Dimanche' },
] as const

type DayKey = (typeof DAYS)[number]['key']
type Horaires = Record<DayKey, { open: boolean; start: string; end: string }>

function HorairesSection({ horaires, setHoraires, onSave }: {
  horaires: Horaires
  setHoraires: (v: Horaires | ((p: Horaires) => Horaires)) => void
  onSave: () => void
}) {
  const toggle = (day: DayKey) =>
    setHoraires((p) => ({ ...p, [day]: { ...p[day], open: !p[day].open } }))
  const setTime = (day: DayKey, field: 'start' | 'end', v: string) =>
    setHoraires((p) => ({ ...p, [day]: { ...p[day], [field]: v } }))

  return (
    <div className="space-y-5">
      <SectionHeader icon={Clock} title="Horaires d'ouverture" subtitle="Définissez vos jours et heures d'ouverture" />
      <Card>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4 py-3">
              <div className="w-24 shrink-0">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
              </div>
              <Toggle enabled={horaires[key].open} onChange={() => toggle(key)} />
              {horaires[key].open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={horaires[key].start}
                    onChange={(e) => setTime(key, 'start', e.target.value)}
                    className="rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
                  />
                  <span className="text-stone-400">→</span>
                  <input
                    type="time"
                    value={horaires[key].end}
                    onChange={(e) => setTime(key, 'end', e.target.value)}
                    className="rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-stone-400 dark:text-slate-500 italic">Fermé</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-slate-700 px-5 py-3">
          <LocalBadge />
          <SaveButton onClick={onSave} label="Enregistrer les horaires" />
        </div>
      </Card>
    </div>
  )
}

// ── Section: Notifications ─────────────────────────────────────────────────────

type Notifs = {
  rdvSms: boolean; rdvEmail: boolean; rdvWhatsapp: boolean
  stockBas: boolean; rapports: boolean; nouveaux: boolean; annulation: boolean
}

function NotificationsSection({ notifs, setNotifs, onSave }: {
  notifs: Notifs
  setNotifs: (v: Notifs | ((p: Notifs) => Notifs)) => void
  onSave: () => void
}) {
  const tog = (k: keyof Notifs) => setNotifs((p) => ({ ...p, [k]: !p[k] }))

  const groups = [
    {
      title: 'Rendez-vous',
      items: [
        { key: 'rdvSms'     as keyof Notifs, label: 'Rappels RDV par SMS',      hint: 'Envoyé 2h avant le RDV'          },
        { key: 'rdvEmail'   as keyof Notifs, label: 'Confirmation par email',    hint: 'Email automatique à la création'  },
        { key: 'rdvWhatsapp'as keyof Notifs, label: 'Rappels WhatsApp',          hint: 'Nécessite une intégration active' },
        { key: 'annulation' as keyof Notifs, label: 'Alerte annulation client',  hint: 'Notifier le responsable'          },
      ],
    },
    {
      title: 'Opérations',
      items: [
        { key: 'stockBas'  as keyof Notifs, label: 'Alertes stock bas',       hint: 'Quand le stock passe sous le minimum' },
        { key: 'nouveaux'  as keyof Notifs, label: 'Nouvelles inscriptions',   hint: 'Chaque nouveau compte client'         },
        { key: 'rapports'  as keyof Notifs, label: 'Rapports hebdomadaires',   hint: 'Résumé envoyé le lundi matin'         },
      ],
    },
  ]

  return (
    <div className="space-y-5">
      <SectionHeader icon={Bell} title="Notifications" subtitle="Configurez vos alertes et rappels automatiques" />
      {groups.map((g) => (
        <Card key={g.title}>
          <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</p>
          </div>
          <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
            {g.items.map(({ key, label, hint }) => (
              <FieldRow key={key} label={label} hint={hint}>
                <Toggle enabled={notifs[key]} onChange={() => tog(key)} />
              </FieldRow>
            ))}
          </div>
        </Card>
      ))}
      <div className="flex items-center justify-between">
        <LocalBadge />
        <SaveButton onClick={onSave} label="Enregistrer" />
      </div>
    </div>
  )
}

// ── Section: Rendez-vous ───────────────────────────────────────────────────────

type RdvSettings = { dureeMin: number; buffer: number; confirmAuto: boolean; annulationH: number; rappelH: number; nbMaxJour: number }

function RendezVousSection({ settings, setSettings, onSave }: {
  settings: RdvSettings
  setSettings: (v: RdvSettings | ((p: RdvSettings) => RdvSettings)) => void
  onSave: () => void
}) {
  const n = (k: keyof RdvSettings) => (v: string) =>
    setSettings((p) => ({ ...p, [k]: parseInt(v, 10) || 0 }))

  return (
    <div className="space-y-5">
      <SectionHeader icon={Calendar} title="Rendez-vous" subtitle="Paramètres de gestion des réservations" />
      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Durées & Capacité</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Durée minimum d'un RDV" hint="En minutes">
            <div className="flex items-center gap-2">
              <Input value={String(settings.dureeMin)} onChange={n('dureeMin')} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">min</span>
            </div>
          </FieldRow>
          <FieldRow label="Tampon entre RDV" hint="Pause entre deux réservations (min)">
            <div className="flex items-center gap-2">
              <Input value={String(settings.buffer)} onChange={n('buffer')} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">min</span>
            </div>
          </FieldRow>
          <FieldRow label="Nb max de RDV par jour" hint="0 = illimité">
            <div className="flex items-center gap-2">
              <Input value={String(settings.nbMaxJour)} onChange={n('nbMaxJour')} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">RDV</span>
            </div>
          </FieldRow>
        </div>
      </Card>

      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Politique & Rappels</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Confirmation automatique" hint="Les RDV sont confirmés sans validation manuelle">
            <Toggle enabled={settings.confirmAuto} onChange={(v) => setSettings((p) => ({ ...p, confirmAuto: v }))} />
          </FieldRow>
          <FieldRow label="Délai d'annulation" hint="Heures avant le RDV où l'annulation est encore possible">
            <div className="flex items-center gap-2">
              <Input value={String(settings.annulationH)} onChange={n('annulationH')} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">h avant</span>
            </div>
          </FieldRow>
          <FieldRow label="Rappel automatique" hint="Envoyé X heures avant le RDV">
            <div className="flex items-center gap-2">
              <Input value={String(settings.rappelH)} onChange={n('rappelH')} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">h avant</span>
            </div>
          </FieldRow>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-slate-700 px-5 py-3">
          <LocalBadge />
          <SaveButton onClick={onSave} label="Enregistrer" />
        </div>
      </Card>
    </div>
  )
}

// ── Section: Paiements ─────────────────────────────────────────────────────────

type PaiementSettings = {
  devise: string; tva: number; especes: boolean; carte: boolean
  wave: boolean; orangeMoney: boolean; virement: boolean; recu: boolean
}

function PaiementsSection({ settings, setSettings, onSave }: {
  settings: PaiementSettings
  setSettings: (v: PaiementSettings | ((p: PaiementSettings) => PaiementSettings)) => void
  onSave: () => void
}) {
  const tog = (k: keyof PaiementSettings) => setSettings((p) => ({ ...p, [k]: !p[k] }))

  const methods = [
    { key: 'especes'    as keyof PaiementSettings, label: 'Espèces',           icon: '💵' },
    { key: 'carte'      as keyof PaiementSettings, label: 'Carte bancaire',     icon: '💳' },
    { key: 'wave'       as keyof PaiementSettings, label: 'Wave',               icon: '🌊' },
    { key: 'orangeMoney'as keyof PaiementSettings, label: 'Orange Money',       icon: '🟠' },
    { key: 'virement'   as keyof PaiementSettings, label: 'Virement bancaire',  icon: '🏦' },
  ]

  return (
    <div className="space-y-5">
      <SectionHeader icon={CreditCard} title="Paiements & Facturation" subtitle="Modes de paiement, devise et paramètres fiscaux" />

      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Paramètres généraux</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Devise" hint="Monnaie utilisée dans toute l'application">
            <select
              value={settings.devise}
              onChange={(e) => setSettings((p) => ({ ...p, devise: e.target.value }))}
              className="w-40 rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
            >
              <option value="XOF">XOF — Franc CFA</option>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dollar</option>
            </select>
          </FieldRow>
          <FieldRow label="TVA (%)" hint="0 = pas de TVA appliquée">
            <div className="flex items-center gap-2">
              <Input value={String(settings.tva)} onChange={(v) => setSettings((p) => ({ ...p, tva: parseFloat(v) || 0 }))} type="number" className="w-20 text-center" />
              <span className="text-sm text-stone-400">%</span>
            </div>
          </FieldRow>
          <FieldRow label="Reçu automatique" hint="Générer un reçu PDF après chaque transaction">
            <Toggle enabled={settings.recu} onChange={() => tog('recu')} />
          </FieldRow>
        </div>
      </Card>

      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Modes de paiement acceptés</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          {methods.map(({ key, label, icon }) => (
            <FieldRow key={key} label={`${icon}  ${label}`}>
              <Toggle enabled={settings[key] as boolean} onChange={() => tog(key)} />
            </FieldRow>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-slate-700 px-5 py-3">
          <LocalBadge />
          <SaveButton onClick={onSave} label="Enregistrer" />
        </div>
      </Card>
    </div>
  )
}

// ── Section: Utilisateurs ──────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  admin:    'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  caissier: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
}

const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Administrateur' },
  { value: 'caissier', label: 'Caissier'       },
]

function UtilisateursSection({ users, isAdmin }: { users: UserProfile[]; isAdmin: boolean }) {
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [pending, startTransition] = useTransition()
  const { push } = useToasts()

  // Invite form state
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'caissier', password: '' })

  function handleInvite() {
    if (!inviteForm.email || !inviteForm.name || !inviteForm.password) {
      push('error', 'Tous les champs sont requis')
      return
    }
    startTransition(async () => {
      const res = await createUserAction(inviteForm.email, inviteForm.name, inviteForm.role, inviteForm.password)
      if (res.error) push('error', res.error)
      else { push('success', 'Utilisateur créé'); setShowInvite(false); setInviteForm({ email: '', name: '', role: 'caissier', password: '' }) }
    })
  }

  function handleRoleUpdate(userId: string, newRole: string) {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole)
      if (res.error) push('error', res.error)
      else { push('success', 'Rôle mis à jour'); setEditUser(null) }
    })
  }

  function handleToggleStatus(user: UserProfile) {
    startTransition(async () => {
      const res = await toggleUserStatusAction(user.id, user.status)
      if (res.error) push('error', res.error)
      else push('success', user.status === 'actif' ? 'Compte désactivé' : 'Compte réactivé')
    })
  }

  return (
    <div className="space-y-5">
      <SectionHeader icon={Users} title="Utilisateurs & Rôles" subtitle="Gérez les accès et les permissions" />

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Créer un utilisateur</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                <input value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
                  placeholder="Prénom Nom" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
                  placeholder="email@spaandco.sn" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Rôle</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none">
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe temporaire</label>
                <input type="password" value={inviteForm.password} onChange={e => setInviteForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none"
                  placeholder="Min. 6 caractères" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowInvite(false)} className="rounded-lg border border-stone-200 dark:border-slate-600 px-4 py-2 text-sm text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 cursor-pointer transition">
                Annuler
              </button>
              <button onClick={handleInvite} disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer transition">
                {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Plus className="h-4 w-4" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit role modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6">
            <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">Modifier le rôle</h3>
            <p className="mb-4 text-xs text-stone-400 dark:text-slate-500">{editUser.name ?? editUser.email}</p>
            <select defaultValue={editUser.role} id="edit-role-select"
              className="w-full rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none mb-4">
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="rounded-lg border border-stone-200 dark:border-slate-600 px-4 py-2 text-sm text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700 cursor-pointer transition">
                Annuler
              </button>
              <button
                onClick={() => {
                  const sel = document.getElementById('edit-role-select') as HTMLSelectElement
                  handleRoleUpdate(editUser.id, sel.value)
                }}
                disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer transition">
                {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check className="h-4 w-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {isAdmin && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition cursor-pointer">
            <Plus className="h-4 w-4" /> Créer un utilisateur
          </button>
        )}
      </div>

      <Card>
        {users.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-stone-400 dark:text-slate-500">
            Aucun utilisateur — exécutez la migration SQL <code className="font-mono text-xs">user_profiles</code>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wide">Utilisateur</th>
                  <th className="px-5 py-3 text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wide">Rôle</th>
                  <th className="px-5 py-3 text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wide">Statut</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-700">
                {users.map((u) => {
                  const initials = (u.name ?? u.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const roleLabel = ROLE_OPTIONS.find(r => r.value === u.role)?.label ?? u.role
                  return (
                    <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-xs font-bold text-primary-700 dark:text-primary-300">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{u.name ?? '—'}</p>
                            <p className="text-xs text-stone-400 dark:text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_BADGE[u.role] ?? 'bg-stone-100 text-stone-600')}>
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={pending}
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition hover:opacity-80',
                              u.status === 'actif'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400',
                            )}
                          >
                            {u.status === 'actif' ? 'Actif' : 'Inactif'}
                          </button>
                        ) : (
                          <span className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            u.status === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500',
                          )}>
                            {u.status === 'actif' ? 'Actif' : 'Inactif'}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setEditUser(u)}
                            className="rounded-lg border border-stone-200 dark:border-slate-600 p-1.5 text-stone-400 hover:bg-stone-50 dark:hover:bg-slate-700 cursor-pointer transition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Rôles disponibles</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'admin',    label: 'Administrateur', desc: 'Accès complet à toutes les fonctionnalités' },
              { role: 'caissier', label: 'Caissier',       desc: 'Caisse, stocks, prestations, RDV — restreint à son spa' },
            ].map(({ role, label, desc }) => (
              <div key={role} className="flex items-start gap-2 rounded-lg border border-stone-200 dark:border-slate-600 p-3">
                <span className={cn('mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium', ROLE_BADGE[role] ?? 'bg-stone-100 text-stone-600')}>
                  {label[0]}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs text-stone-400 dark:text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Section: Sécurité ──────────────────────────────────────────────────────────

function SecuriteSection() {
  const [showPwd, setShowPwd] = useState(false)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  return (
    <div className="space-y-5">
      <SectionHeader icon={Shield} title="Sécurité" subtitle="Gérez vos identifiants et la protection du compte" />

      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Changer le mot de passe</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Mot de passe actuel">
            <div className="relative">
              <Input
                value={pwd.current}
                onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldRow>
          <FieldRow label="Nouveau mot de passe">
            <Input
              value={pwd.next}
              onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
              type="password"
              placeholder="••••••••"
            />
          </FieldRow>
          <FieldRow label="Confirmer">
            <div className="flex items-center gap-2">
              <Input
                value={pwd.confirm}
                onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))}
                type="password"
                placeholder="••••••••"
              />
              {pwd.next && pwd.confirm && (
                pwd.next === pwd.confirm
                  ? <Check className="h-4 w-4 text-emerald-500" />
                  : <AlertCircle className="h-4 w-4 text-rose-500" />
              )}
            </div>
          </FieldRow>
        </div>
        <div className="flex justify-end border-t border-stone-100 dark:border-slate-700 px-5 py-3">
          <button
            disabled={!pwd.current || pwd.next !== pwd.confirm || pwd.next.length < 8}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40 transition cursor-pointer"
          >
            Mettre à jour
          </button>
        </div>
      </Card>

      <Card>
        <div className="border-b border-stone-100 dark:border-slate-700 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Authentification</p>
        </div>
        <div className="px-5 py-1 divide-y divide-stone-100 dark:divide-slate-700">
          <FieldRow label="Double authentification (2FA)" hint="Renforce la sécurité de votre compte">
            <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 text-xs font-medium border border-amber-200 dark:border-amber-800">
              Non configuré
            </span>
          </FieldRow>
          <FieldRow label="Session active" hint="Appareil courant">
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400">
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              Connecté maintenant
            </div>
          </FieldRow>
        </div>
      </Card>
    </div>
  )
}

// ── Section: Journal d'activité ────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: 'Créé',    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
  updated: { label: 'Modifié', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'           },
  deleted: { label: 'Supprimé',color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'           },
}

function JournalSection({ logs }: { logs: AuditLogEntry[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = logs.filter((l) => {
    if (filter !== 'all' && l.action !== filter) return false
    if (search && !`${l.entity_type} ${l.entity_name} ${l.actor_email}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5">
      <SectionHeader icon={Activity} title="Journal d'activité" subtitle="Historique de toutes les actions effectuées dans le CRM" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="rounded-lg border border-stone-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-primary-400 focus:outline-none flex-1 min-w-40"
        />
        {['all', 'created', 'updated', 'deleted'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition',
              filter === f
                ? 'bg-primary-600 text-white'
                : 'border border-stone-200 dark:border-slate-600 text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700',
            )}
          >
            {f === 'all' ? 'Tout' : ACTION_LABELS[f]?.label ?? f}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Activity className="mx-auto mb-2 h-8 w-8 text-stone-300 dark:text-slate-600" />
            <p className="text-sm text-stone-400 dark:text-slate-500">Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-slate-700">
            {filtered.slice(0, 30).map((log) => {
              const actionInfo = ACTION_LABELS[log.action] ?? { label: log.action, color: 'bg-stone-100 text-stone-600' }
              const date = new Date(log.created_at)
              return (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={cn('mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', actionInfo.color)}>
                    {actionInfo.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white">
                      <span className="font-medium">{log.entity_type}</span>
                      {log.entity_name && <span className="text-stone-500 dark:text-slate-400"> — {log.entity_name}</span>}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-slate-500">
                      {log.actor_email ?? 'Système'} · {log.actor_role}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-stone-400 dark:text-slate-500">
                    {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    {' '}
                    {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              )
            })}
            {filtered.length > 30 && (
              <p className="px-5 py-3 text-center text-xs text-stone-400 dark:text-slate-500">
                {filtered.length - 30} entrées supplémentaires non affichées
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────

interface Props {
  establishment: Establishment | null
  establishments: Establishment[]
  logs: AuditLogEntry[]
  users: UserProfile[]
  isAdmin: boolean
}

export function SettingsView({ establishment, logs, users, isAdmin }: Props) {
  const [section, setSection] = useState<Section>('etablissement')
  const { toasts, push } = useToasts()
  const [isPending, startTransition] = useTransition()

  // ── Preferences (localStorage) ──
  const [horaires, setHoraires] = useLocalPref<Horaires>('horaires', {
    lundi:    { open: true,  start: '08:00', end: '20:00' },
    mardi:    { open: true,  start: '08:00', end: '20:00' },
    mercredi: { open: true,  start: '08:00', end: '20:00' },
    jeudi:    { open: true,  start: '08:00', end: '20:00' },
    vendredi: { open: true,  start: '08:00', end: '20:00' },
    samedi:   { open: true,  start: '09:00', end: '18:00' },
    dimanche: { open: false, start: '10:00', end: '16:00' },
  })

  const [notifs, setNotifs] = useLocalPref<Notifs>('notifs', {
    rdvSms: true, rdvEmail: true, rdvWhatsapp: false,
    stockBas: true, rapports: false, nouveaux: true, annulation: true,
  })

  const [rdvSettings, setRdvSettings] = useLocalPref<RdvSettings>('rdv', {
    dureeMin: 30, buffer: 10, confirmAuto: false, annulationH: 24, rappelH: 2, nbMaxJour: 0,
  })

  const [paiements, setPaiements] = useLocalPref<PaiementSettings>('paiements', {
    devise: 'XOF', tva: 0, especes: true, carte: true,
    wave: true, orangeMoney: true, virement: false, recu: true,
  })

  // ── Save handlers ──
  function saveEstablishment(form: EstabForm) {
    if (!establishment?.id) { push('error', 'Aucun établissement sélectionné'); return }
    startTransition(async () => {
      const res = await updateEstablishment(establishment.id, {
        name:    form.name    || undefined,
        city:    form.city    || undefined,
        address: form.address || null,
        phone:   form.phone   || null,
      })
      if (res.error) push('error', res.error)
      else push('success', 'Établissement mis à jour')
    })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Toast container */}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right-4 duration-200',
              t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
            )}
          >
            {t.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 overflow-y-auto">
        <div className="p-4">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-600">
            Configuration
          </p>
          {NAV.map(({ key, icon: Icon, label, desc }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all mb-0.5 cursor-pointer',
                section === key
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', section === key ? 'text-primary-600' : 'text-stone-400 dark:text-slate-500')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className="mt-0.5 truncate text-[11px] text-stone-400 dark:text-slate-500">{desc}</p>
              </div>
              {section === key && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary-400" />}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Mobile nav ── */}
      <div className="fixed left-0 right-0 top-16 z-30 border-b border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:hidden">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer',
                section === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto p-4 pt-14 lg:p-6 lg:pt-6">
        <div className="mx-auto max-w-2xl">
          {section === 'etablissement' && (
            <EtablissementSection
              establishment={establishment}
              onSave={saveEstablishment}
              pending={isPending}
            />
          )}
          {section === 'horaires' && (
            <HorairesSection
              horaires={horaires}
              setHoraires={setHoraires}
              onSave={() => push('success', 'Horaires enregistrés')}
            />
          )}
          {section === 'notifications' && (
            <NotificationsSection
              notifs={notifs}
              setNotifs={setNotifs}
              onSave={() => push('success', 'Notifications enregistrées')}
            />
          )}
          {section === 'rendez-vous' && (
            <RendezVousSection
              settings={rdvSettings}
              setSettings={setRdvSettings}
              onSave={() => push('success', 'Paramètres RDV enregistrés')}
            />
          )}
          {section === 'paiements' && (
            <PaiementsSection
              settings={paiements}
              setSettings={setPaiements}
              onSave={() => push('success', 'Paiements enregistrés')}
            />
          )}
          {section === 'utilisateurs' && (
            <UtilisateursSection users={users} isAdmin={isAdmin} />
          )}
          {section === 'securite' && <SecuriteSection />}
          {section === 'journal' && <JournalSection logs={logs} />}
        </div>
      </main>
    </div>
  )
}
