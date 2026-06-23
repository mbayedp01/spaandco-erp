'use client'

import { Header } from '@/components/layout/header'
import { establishments, appUsers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Building2, Clock, Bell, Shield, Users, MapPin, Plus, Pencil } from 'lucide-react'
import { useState } from 'react'

const sections = [
  {
    icon: Building2,
    title: 'Établissement principal',
    fields: [
      { label: 'Nom', value: 'Spa and Co', type: 'text' },
      { label: 'Adresse', value: 'Almadies, Dakar, Sénégal', type: 'text' },
      { label: 'Téléphone', value: '+221 33 800 00 00', type: 'text' },
      { label: 'Email', value: 'contact@spaandco.sn', type: 'email' },
      { label: 'Site web', value: 'www.spaandco.sn', type: 'text' },
    ],
  },
  {
    icon: Clock,
    title: "Horaires d'ouverture",
    fields: [
      { label: 'Lundi – Vendredi', value: '08:00 – 20:00', type: 'text' },
      { label: 'Samedi', value: '09:00 – 18:00', type: 'text' },
      { label: 'Dimanche', value: 'Fermé', type: 'text' },
      { label: 'Durée min. RDV', value: '30 minutes', type: 'text' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    toggles: [
      { label: 'Rappels RDV par SMS', enabled: true },
      { label: 'Confirmation par email', enabled: true },
      { label: 'Alertes stock bas', enabled: true },
      { label: 'Rapports hebdomadaires', enabled: false },
      { label: 'Nouvelles inscriptions', enabled: true },
    ],
  },
  {
    icon: Shield,
    title: 'Accès & Sécurité',
    fields: [
      { label: 'Identifiant admin', value: 'admin@spaandco.sn', type: 'text' },
      { label: 'Mot de passe', value: '••••••••', type: 'password' },
      { label: 'Authentification 2FA', value: 'Activée', type: 'text' },
    ],
  },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<'general' | 'etablissements' | 'utilisateurs'>('general')

  return (
    <>
      <Header title="Paramètres" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Onglets */}
        <div className="mb-6 flex gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1 w-fit">
          {([
            { key: 'general', label: 'Général' },
            { key: 'etablissements', label: 'Établissements' },
            { key: 'utilisateurs', label: 'Utilisateurs' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                tab === t.key ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-500 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Onglet Général */}
        {tab === 'general' && (
          <div className="mx-auto max-w-2xl space-y-6">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <div key={section.title} className="rounded-lg border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  <div className="divide-y divide-stone-100 px-5">
                    {'fields' in section && section.fields?.map((f) => (
                      <div key={f.label} className="flex items-center justify-between py-3.5">
                        <label className="text-sm font-medium text-slate-700">{f.label}</label>
                        <input
                          type={f.type}
                          defaultValue={f.value}
                          className="w-52 rounded-md border border-stone-200 px-3 py-1.5 text-sm text-slate-900 focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                    ))}
                    {'toggles' in section && section.toggles?.map((t) => (
                      <div key={t.label} className="flex items-center justify-between py-3.5">
                        <span className="text-sm font-medium text-slate-700">{t.label}</span>
                        <div className={cn('relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors', t.enabled ? 'bg-primary-600' : 'bg-stone-200')}>
                          <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', t.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <button className="w-full rounded-md bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
              Enregistrer les modifications
            </button>
          </div>
        )}

        {/* Onglet Établissements */}
        {tab === 'etablissements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">{establishments.length} établissements dans le groupe</p>
              <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
                <Plus className="h-4 w-4" />
                Ajouter un site
              </button>
            </div>
            {establishments.map((e) => (
              <div key={e.id} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{e.name}</p>
                  <p className="text-sm text-stone-500">{e.address} · {e.staff} employés</p>
                </div>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  e.status === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>
                  {e.status === 'actif' ? 'Actif' : 'Ouverture prochaine'}
                </span>
                <button className="rounded-md border border-stone-200 p-2 text-stone-500 hover:bg-stone-50 cursor-pointer">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="rounded-lg border-2 border-dashed border-stone-200 p-8 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-stone-300" />
              <p className="text-sm font-medium text-stone-500">Ouvrir un nouveau site</p>
              <p className="mt-1 text-xs text-stone-400">Gérez tous vos spas depuis un seul tableau de bord</p>
              <button className="mt-3 rounded-md border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer">
                Commencer la configuration
              </button>
            </div>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {tab === 'utilisateurs' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-stone-500">{appUsers.length} comptes utilisateurs</p>
              <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
                <Plus className="h-4 w-4" />
                Inviter un utilisateur
              </button>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                      <th className="px-5 py-3">Utilisateur</th>
                      <th className="px-5 py-3">Rôle</th>
                      <th className="hidden px-5 py-3 md:table-cell">Dernière connexion</th>
                      <th className="px-5 py-3">Statut</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {appUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{u.name}</p>
                              <p className="text-xs text-stone-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                            {u.role}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 text-stone-500 md:table-cell">{u.lastLogin}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            u.status === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                          )}>
                            {u.status === 'actif' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="rounded-md border border-stone-200 p-1.5 text-stone-400 hover:bg-stone-50 cursor-pointer">
                            <Pencil className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                  <Users className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Rôles et permissions</p>
                  <p className="text-xs text-stone-500">Administrateur · Gérant · Thérapeute · Caissière · Réceptionniste</p>
                </div>
                <button className="ml-auto rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer">
                  Gérer les rôles
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
