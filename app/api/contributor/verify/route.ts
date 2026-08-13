import { after, NextResponse } from 'next/server'
import { publicEnv } from '@/lib/env'
import { hashToken } from '@/lib/security'
import { requireSecretClient } from '@/lib/supabase/secret'
import { sendApplicationReceived } from '@/lib/email'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token || token.length > 200) return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=invalid`)
  const client = requireSecretClient()
  const { data, error } = await client.rpc('verify_contributor_application', { p_token_hash: hashToken(token) })
  const verified = data?.[0]
  if (error || !verified) return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=invalid`)
  after(async () => { await sendApplicationReceived(verified.email, verified.name, verified.application_id) })
  return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=success`)
}

export const maxDuration = 120
