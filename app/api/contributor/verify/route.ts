import { after, NextResponse } from 'next/server'
import { publicEnv } from '@/lib/env'
import { hashToken } from '@/lib/security'
import { requireServiceClient } from '@/lib/supabase/service'
import { processAgentJob } from '@/lib/agent/process'
import { sendApplicationReceived } from '@/lib/email'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token || token.length > 200) return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=invalid`)
  const client = requireServiceClient()
  const { data, error } = await client.rpc('verify_contributor_application', { p_token_hash: hashToken(token) })
  const verified = data?.[0]
  if (error || !verified) return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=invalid`)
  after(async () => {
    await Promise.allSettled([
      processAgentJob(verified.job_id),
      sendApplicationReceived(verified.email, verified.name, verified.application_id),
    ])
  })
  return NextResponse.redirect(`${publicEnv.siteUrl}/community/contribute/apply/verified?status=success`)
}

export const maxDuration = 120
