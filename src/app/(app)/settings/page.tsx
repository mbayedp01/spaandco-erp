import { Header } from '@/components/layout/header'
import { Building2, Clock, Bell, Shield, Palette } from 'lucide-react'

const sections = [
  {
    icon: Building2,
    title: 'Établissement',
    fields: [
      { label: 'Nom du spa', value: 'Spa and Co', type: 'text' },
      { label: 'Adresse', value: 'Almadies, Dakar, Sénégal', type: 'text' },
      { label: 'Téléphone', value: '+221 33 800 00 00', type: 'text' },
      { label: 'Email', value: 'contact@spaandco.sn', type: 'email' },
    ],
  },
  {
    icon: Clock,
    title: 'Horaires d\'ouverture',
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
    ],
  },
  {
    icon: Shield,
    title: 'Accès & Sécurité',
    fields: [
      { label: 'Identifiant admin', value: 'Admin', type: 'text' },
      { label: 'Mot de passe', value: '••••••••', type: 'password' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <>
      <Header title="Paramètres" />
      <div className="flex-1 overflow-y-auto p-6">
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
                  {'fields' in section &&
                    section.fields?.map((f) => (
                      <div key={f.label} className="flex items-center justify-between py-3.5">
                        <label className="text-sm font-medium text-slate-700">{f.label}</label>
                        <input
                          type={f.type}
                          defaultValue={f.value}
                          className="w-52 rounded-md border border-stone-200 px-3 py-1.5 text-sm text-slate-900 focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  {'toggles' in section &&
                    section.toggles?.map((t) => (
                      <div key={t.label} className="flex items-center justify-between py-3.5">
                        <span className="text-sm font-medium text-slate-700">{t.label}</span>
                        <div className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${t.enabled ? 'bg-primary-600' : 'bg-stone-200'}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${t.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
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
      </div>
    </>
  )
}
