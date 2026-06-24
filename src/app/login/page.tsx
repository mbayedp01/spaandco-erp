'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { login, type LoginState } from '@/lib/auth'
import { Sparkles, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'Gestion multi-établissements',
  'Rendez-vous & planning en temps réel',
  'Caisse, inventaire & comptabilité',
  'Accès multi-rôles (Admin, Caissier, Médecin)',
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-700/40 disabled:opacity-60 cursor-pointer"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Connexion en cours…' : 'Se connecter'}
    </button>
  )
}

const initialState: LoginState = {}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen">

      {/* ── Left panel — branding ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-sidebar p-12">

        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-primary-400/10 blur-[80px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-600/40">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">Spa and Co</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
            Plateforme ERP bien-être
          </p>
          <h2 className="font-serif text-5xl font-bold leading-tight text-white">
            Gérez votre<br />
            <span className="text-primary-400">espace bien-être</span><br />
            avec élégance
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-400">
            Tout ce dont vous avez besoin pour piloter<br />
            votre spa, en un seul espace.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                <span className="text-sm text-slate-300">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-slate-600">
          © 2025 Spa and Co · Tous droits réservés
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-16">

        {/* Mobile logo */}
        <div className="mb-10 flex flex-col items-center lg:hidden">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-xl shadow-primary-600/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">Spa and Co</h1>
          <p className="mt-1 text-sm text-stone-400">Espace de gestion</p>
        </div>

        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Bon retour 👋</h2>
            <p className="mt-1.5 text-sm text-stone-400">
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          <form action={formAction} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-stone-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-50"
                  placeholder="vous@spaandco.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-stone-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors hover:text-stone-600 cursor-pointer"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <p className="text-sm text-rose-700">{state.error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <SubmitButton />
            </div>
          </form>

          <p className="mt-10 text-center text-xs text-stone-300">
            Spa and Co ERP · v1.0
          </p>
        </div>
      </div>

    </main>
  )
}
