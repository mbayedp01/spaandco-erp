'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function switchSpa(spaId: string): Promise<void> {
  cookies().set('selected_spa', spaId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: 'lax',
  })
  revalidatePath('/', 'layout')
}
