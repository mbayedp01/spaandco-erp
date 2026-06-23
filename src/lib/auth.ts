'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export interface LoginState {
  error?: string
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email    = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Identifiant ou mot de passe incorrect.' }
  }

  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
