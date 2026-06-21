'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Authentification de démonstration (frontend statique).
 * Identifiants de test : Admin / Admin123
 * À remplacer par Supabase Auth une fois la BDD en ligne.
 */
const DEMO_USER = 'Admin'
const DEMO_PASSWORD = 'Admin123'
const SESSION_COOKIE = 'spaandco_session'

export interface LoginState {
  error?: string
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (username !== DEMO_USER || password !== DEMO_PASSWORD) {
    return { error: 'Identifiant ou mot de passe incorrect.' }
  }

  cookies().set(SESSION_COOKIE, 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  })

  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  cookies().delete(SESSION_COOKIE)
  redirect('/login')
}
