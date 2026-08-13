import { NextResponse } from 'next/server'
import { requireServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = requireServiceClient()
  const [{ data: expired, error: expiryError }, { data: scrubbed, error }, cleanup] = await Promise.all([
    client.rpc('expire_unverified_applications'),
    client.rpc('scrub_expired_applications'),
    client.from('form_rate_limits').delete().lt('expires_at', new Date().toISOString()),
  ])
  if (expiryError || error || cleanup.error) return NextResponse.json({ error: 'Retention process failed.' }, { status: 500 })
  return NextResponse.json({ expired_unverified_applications: expired, scrubbed_applications: scrubbed, expired_rate_limits_deleted: true })
}

export const GET = POST
export const maxDuration = 60
