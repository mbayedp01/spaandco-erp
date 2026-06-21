'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from '@/lib/auth'
import { Sparkles, Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  )
}

const initialState: LoginState = {}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Spa and Co</h1>
          <p className="mt-1 text-sm text-stone-500">Gestion de spa & bien-être</p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
              Identifiant
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
          )}

          <SubmitButton />

          <p className="text-center text-xs text-stone-400">
            Démo : identifiant <span className="font-semibold">Admin</span> · mot de passe{' '}
            <span className="font-semibold">Admin123</span>
          </p>
        </form>
      </div>
    </main>
  )
}
