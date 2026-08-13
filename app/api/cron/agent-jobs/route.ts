import { NextResponse } from 'next/server'
import { processRetryableAgentJobs } from '@/lib/agent/process'

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const outcomes = await processRetryableAgentJobs(10)
  return NextResponse.json({ processed: outcomes.filter((result) => result.processed).length, outcomes })
}

export const GET = POST
export const maxDuration = 120
