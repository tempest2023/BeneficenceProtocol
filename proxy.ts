import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { publicEnv } from '@/lib/env'

export async function proxy(request: NextRequest) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseKey) return NextResponse.next({ request })
  let response = NextResponse.next({ request })
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  await supabase.auth.getUser()
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = { matcher: ['/admin/:path*', '/auth/:path*'] }
