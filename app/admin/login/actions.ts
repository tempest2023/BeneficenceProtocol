'use server'

import { redirect } from 'next/navigation'
import { isDirectAdminLoginEnabled, publicEnv } from '@/lib/env'
import { isAllowedAdminEmail } from '@/lib/admin/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireSecretClient } from '@/lib/supabase/secret'
import type { ActionState } from '@/lib/community/types'

export async function requestAdminLink(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) return { status: 'error', message: 'Enter a valid administrator email.' }
  const client = await createSupabaseServerClient()
  if (!client) return { status: 'error', message: 'Supabase authentication is not configured.' }

  const directLogin = isDirectAdminLoginEnabled()
  const authorized = await isAllowedAdminEmail(email)
  if (!authorized) {
    return {
      status: 'success',
      message: directLogin
        ? 'If this address is authorized, you will be signed in.'
        : 'If this address is authorized, a sign-in link has been sent.',
    }
  }

  if (directLogin) {
    const service = requireSecretClient()
    const { data, error: linkError } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${publicEnv.siteUrl}/auth/callback?next=/admin` },
    })
    if (linkError || !data.properties.hashed_token) {
      return { status: 'error', message: 'The development sign-in session could not be created.' }
    }

    const { error: verificationError } = await client.auth.verifyOtp({
      token_hash: data.properties.hashed_token,
      type: 'email',
    })
    if (verificationError) {
      return { status: 'error', message: 'The development sign-in session could not be verified.' }
    }

    redirect('/admin')
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=/admin` },
  })
  if (error) return { status: 'error', message: 'The sign-in email could not be sent.' }
  return { status: 'success', message: 'If this address is authorized, a sign-in link has been sent.' }
}
