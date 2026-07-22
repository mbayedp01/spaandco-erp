'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createUserAction, updateUserRoleAction, deleteUserAction } from '@/app/actions/users'
import type { UserProfile } from '@/lib/db/users'

const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Administrateur', color: 'bg-primary-50 text-primary-700' },
  { value: 'caissier', label: 'Caissier',       color: 'bg-emerald-50 text-emerald-700' },
  { value: 'medecin',  label: 'Thérapeute',     color: 'bg-blue-50 text-blue-700' },
]

const inputCls = 'w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500'
const labelCls = 'block text-xs font-medium text-stone-600 mb-1'

function getRoleColor(role: string) {
  return ROLE_OPTIONS.find(r => r.value === role)?.color ?? 'bg-stone-100 text-stone-600'
}
function getRoleLabel(role: string) {
  return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role
}

// ── Create modal ────────────────────────────────────────────────────────────────

function CreateModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'medecin', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Tous les champs sont requis'); return }
    if (form.password.length < 6) { setError('Mot de passe : 6 caractères minimum'); return }
    start(async () => {
      const res = await createUserAction(form.email, form.name, form.role, form.password)
      if (res.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-stone-200 px-6 py-4">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-slate-900">Créer un utilisateur</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className={labelCls}>Nom complet *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Prénom Nom" />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="email@spaandco.sn" />
          </div>
          <div>
            <label className={labelCls}>Rôle</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Mot de passe temporaire *</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={cn(inputCls, 'pr-10')} placeholder="Min. 6 caractères" />
              <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit modal ──────────────────────────────────────────────────────────────────

function EditModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const [role, setRole] = useState(user.role)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    start(async () => {
      const res = await updateUserRoleAction(user.id, role)
      if (res.error) { setError(res.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-stone-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Modifier le rôle</h2>
          <p className="mt-0.5 text-xs text-stone-400">{user.name ?? user.email}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className={labelCls}>Rôle</label>
            <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-md border border-stone-200 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="flex-1 rounded-md bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer">
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main view ───────────────────────────────────────────────────────────────────

export function UsersView({ users: initial }: { users: UserProfile[] }) {
  const [users, setUsers] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser]     = useState<UserProfile | null>(null)
  const [pending, start]            = useTransition()

  const actifs    = users.filter(u => u.status === 'actif').length
  const admins    = users.filter(u => u.role === 'admin').length
  const therapists= users.filter(u => u.role === 'medecin').length

  function handleDelete(userId: string, name: string) {
    if (!confirm(`Désactiver le compte de ${name} ?`)) return
    start(async () => {
      await deleteUserAction(userId)
      setUsers(p => p.map(u => u.id === userId ? { ...u, status: 'inactif' } : u))
    })
  }

  function closeCreate() {
    setShowCreate(false)
    setUsers(initial)
    window.location.reload()
  }

  function closeEdit() {
    setEditUser(null)
    window.location.reload()
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      {showCreate && <CreateModal onClose={closeCreate} />}
      {editUser   && <EditModal user={editUser} onClose={closeEdit} />}

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: 'Total', value: users.length, color: 'text-slate-900' },
          { label: 'Actifs', value: actifs, color: 'text-emerald-700' },
          { label: 'Administrateurs', value: admins, color: 'text-primary-700' },
          { label: 'Thérapeutes', value: therapists, color: 'text-blue-700' },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <p className="text-xs text-stone-500">{k.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Comptes utilisateurs ({users.length})</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Créer un utilisateur
          </button>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-stone-100 sm:hidden">
          {users.map(u => {
            const initials = (u.name ?? u.email).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={u.id} className={cn('flex items-center gap-3 px-4 py-3', u.status !== 'actif' && 'opacity-50')}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{u.name ?? '—'}</p>
                  <p className="text-xs text-stone-400 truncate">{u.email}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', getRoleColor(u.role))}>
                  {getRoleLabel(u.role)}
                </span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setEditUser(u)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer" title="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(u.id, u.name ?? u.email)} disabled={pending} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer disabled:opacity-40" title="Désactiver">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                <th className="px-5 py-3">Utilisateur</th>
                <th className="px-5 py-3">Rôle</th>
                <th className="px-5 py-3">Statut</th>
                <th className="hidden px-5 py-3 md:table-cell">Créé le</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map(u => {
                const initials = (u.name ?? u.email).split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                const isInactive = u.status !== 'actif'
                return (
                  <tr key={u.id} className={cn('hover:bg-stone-50 transition-colors', isInactive && 'opacity-50')}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.name ?? '—'}</p>
                          <p className="text-xs text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', getRoleColor(u.role))}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        u.status === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                      )}>
                        {u.status === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-stone-400 md:table-cell">
                      {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setEditUser(u)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-slate-700 cursor-pointer transition-colors" title="Modifier le rôle">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.name ?? u.email)} disabled={pending || isInactive} className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-30" title={isInactive ? 'Déjà inactif' : 'Désactiver'}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-stone-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Légende rôles */}
        <div className="border-t border-stone-100 px-5 py-4">
          <p className="mb-2 text-xs font-medium text-stone-500">Rôles disponibles</p>
          <div className="flex flex-wrap gap-3">
            {[
              { role: 'admin',    desc: 'Accès complet à toutes les fonctionnalités' },
              { role: 'caissier', desc: 'Caisse, stocks, rendez-vous' },
              { role: 'medecin',  desc: 'Planning et rendez-vous uniquement' },
            ].map(({ role, desc }) => (
              <div key={role} className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getRoleColor(role))}>
                  {getRoleLabel(role)}
                </span>
                <span className="text-xs text-stone-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
