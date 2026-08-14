import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { safeLocalPath } from '@/lib/security'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeLocalPath(url.searchParams.get('next'), '/admin')
  if (code) {
    const client = await createSupabaseServerClient()
    const { error } = await client?.auth.exchangeCodeForSession(code) ?? { error: new Error('Authentication is not configured.') }
    if (!error) return NextResponse.redirect(new URL(next, url.origin))
  }
  return NextResponse.redirect(new URL('/admin/login?error=invalid_link', url.origin))
}
