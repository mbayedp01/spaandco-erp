'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUserRole } from '@/lib/user-role'

export async function updateEstablishment(
  id: string,
  data: { name?: string; city?: string; address?: string | null; phone?: string | null },
): Promise<{ error?: string; success?: boolean }> {
  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Permission refusée' }

  const supabase = createServerClient() as any
  const { error } = await supabase
    .from('establishments')
    .update(data)
    .eq('id', id)

  if (error) return { error: (error as { message: string }).message }
  revalidatePath('/settings')
  return { success: true }
}
