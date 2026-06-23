'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/db/clients'

export async function createClientAction(formData: FormData) {
  const first_name = String(formData.get('first_name') ?? '').trim()
  const last_name  = String(formData.get('last_name')  ?? '').trim()
  const email      = String(formData.get('email')      ?? '').trim()
  const phone      = String(formData.get('phone')      ?? '').trim()

  if (!first_name || !last_name) throw new Error('Prénom et nom requis')

  await createClient({ first_name, last_name, email, phone })
  revalidatePath('/clients')
}
