'use server'

import { publicEnv } from '@/lib/env'
import { isAllowedAdminEmail } from '@/lib/admin/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/community/types'

export async function requestAdminLink(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) return { status: 'error', message: 'Enter a valid administrator email.' }
  const client = await createSupabaseServerClient()
  if (!client) return { status: 'error', message: 'Supabase authentication is not configured.' }
  if (await isAllowedAdminEmail(email)) {
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=/admin` } })
    if (error) return { status: 'error', message: 'The sign-in email could not be sent.' }
  }
  return { status: 'success', message: 'If this address is authorized, a sign-in link has been sent.' }
}
